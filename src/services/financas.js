/**
 * src/services/financas.js
 * ---------------------------------------------------------------------------
 * Camada de serviço: toda a conversa com a coleção "financas" do Firestore.
 *
 * ESTRUTURA REAL DO BANCO (criada no console do Firebase):
 *
 *   coleção "financas"
 *    ├── documento "gastoAtual"
 *    │     └── "gasto atual": 455.5            (number)
 *    │
 *    └── documento "ultimosgastos"
 *          ├── "Gasto Atual": 455.5            (number)
 *          └── ultimosGastos: [                (array de maps)
 *                { data: "28/10/2026", descricao: "Supermercado", valor: 250 },
 *                { data: "27/10/2026", descricao: "Farmácia",     valor: 85.5 },
 *                { data: "26/10/2026", descricao: "Restaurante",  valor: 50 }
 *              ]
 *
 * PONTOS DE ATENÇÃO (armadilhas reais deste formato):
 *   - Os nomes dos campos têm ESPAÇO e maiúsculas diferentes:
 *     "gasto atual" (no doc gastoAtual) e "Gasto Atual" (no doc ultimosgastos).
 *     É OBRIGATÓRIO escrever exatamente assim, entre aspas, ou o valor vem
 *     undefined. O Firestore diferencia "Gasto Atual" de "gasto atual".
 *   - A data já vem como TEXTO ("28/10/2026"), não como Timestamp. Não dá
 *     para ordenar por ela de verdade; tratamos como string de exibição.
 *   - Os dados NÃO têm campo `uid`: hoje são globais (compartilhados).
 *     Se um dia cada usuário tiver seus próprios gastos, será preciso criar
 *     um campo `uid` em cada documento e reescrever as regras de segurança.
 * ---------------------------------------------------------------------------
 */
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  increment,
} from "firebase/firestore";

import { db } from "../../firebaseConfig";

const NOME_COLECAO = "financas";
const DOC_GASTO_ATUAL = "gastoAtual";
const DOC_ULTIMOS_GASTOS = "ultimosgastos";

/**
 * Lê UM número do snapshot, tolerando valores ausentes ou não numéricos.
 * `?? 0` cobre undefined/null; `Number(...) || 0` cobre strings e NaN.
 */
function numeroSeguro(valor) {
  return Number(valor) || 0;
}

/**
 * Escuta EM TEMPO REAL os dois documentos das finanças.
 *
 * onSnapshot é o coração do Firestore: em vez de "buscar uma vez", registramos
 * observadores. O Firebase chama o callback imediatamente com o que já existe
 * e DE NOVO sozinho sempre que alguém alterar um documento -- a tela se
 * atualiza sem precisar de "puxar para atualizar".
 *
 * Como a informação está repartida em DOIS documentos, usamos dois
 * observadores e combinamos os dados antes de entregar à tela. A função
 * interna `emitir` só entrega quando já há algo lido dos dois lados, para a
 * tela não piscar "0,00" antes dos dados chegar.
 *
 * @param {(dados: { gastoAtual: number, lista: Array<object> }) => void} aoChegar
 *        recebe o total e a lista de gastos prontos para exibir
 * @param {(erro: Error) => void} [aoFalhar] tratamento de erro (permissão, rede)
 * @returns {() => void} função que cancela AS DUAS escutas (cleanup do useEffect)
 */
export function observarFinancas(aoChegar, aoFalhar) {
  const referenciaGastoAtual = doc(db, NOME_COLECAO, DOC_GASTO_ATUAL);
  const referenciaUltimos = doc(db, NOME_COLECAO, DOC_ULTIMOS_GASTOS);

  let dadosGastoAtual = null;
  let dadosUltimosGastos = null;

  const emitir = () => {
    // Se ainda não chegou nada de um dos dois documentos, espera.
    if (dadosGastoAtual === null || dadosUltimosGastos === null) return;

    // O total tem duas fontes (uma em cada documento). Preferimos a do
    // documento "gastoAtual"; se ela faltar, caímos na outra.
    const gastoAtual =
      dadosGastoAtual["gasto atual"] !== undefined
        ? numeroSeguro(dadosGastoAtual["gasto atual"])
        : numeroSeguro(dadosUltimosGastos["Gasto Atual"]);

    // O array pode conter entradas incompletas; normalizamos cada uma.
    const lista = (dadosUltimosGastos.ultimosGastos ?? []).map(
      (item, indice) => ({
        id: `${indice}-${item?.descricao ?? ""}`, // chave estável para a FlatList
        descricao: item?.descricao ?? "(sem descrição)",
        valor: numeroSeguro(item?.valor),
        data: item?.data ?? "", // já é texto "dd/mm/aaaa"
      })
    );

    aoChegar({ gastoAtual, lista });
  };

  const cancelarGastoAtual = onSnapshot(
    referenciaGastoAtual,
    (snap) => {
      dadosGastoAtual = snap.exists() ? snap.data() : {};
      emitir();
    },
    aoFalhar
  );

  const cancelarUltimos = onSnapshot(
    referenciaUltimos,
    (snap) => {
      dadosUltimosGastos = snap.exists() ? snap.data() : {};
      emitir();
    },
    aoFalhar
  );

  // O useEffect do React exige UMA função de limpeza; cancelamos as duas.
  return () => {
    cancelarGastoAtual();
    cancelarUltimos();
  };
}

/**
 * Registra um novo gasto DENTRO do formato existente no banco.
 *
 * Repare que não criamos um documento novo: atualizamos os dois que já
 * existem, cada um à sua maneira:
 *   - arrayUnion() acrescenta o objeto ao FIM do array ultimosGastos, sem
 *     sobrescrever os itens que já estão lá;
 *   - increment() SOMAO valor ao total que já existe (não substitui).
 *
 * A data é gravada como texto no mesmo formato do resto do banco.
 *
 * @param {{ descricao: string, valor: number, data?: Date }} gasto
 * @returns {Promise<void>}
 */
export async function adicionarGasto({ descricao, valor, data }) {
  const valorNumerico = numeroSeguro(valor);
  const dataTexto =
    data instanceof Date
      ? data.toLocaleDateString("pt-BR")
      : new Date().toLocaleDateString("pt-BR");

  const referenciaUltimos = doc(db, NOME_COLECAO, DOC_ULTIMOS_GASTOS);
  const referenciaGastoAtual = doc(db, NOME_COLECAO, DOC_GASTO_ATUAL);

  // Duas escritas em paralelo; Promise.all falha se qualquer uma falhar.
  await Promise.all([
    updateDoc(referenciaUltimos, {
      ultimosGastos: arrayUnion({
        data: dataTexto,
        descricao,
        valor: valorNumerico,
      }),
      "Gasto Atual": increment(valorNumerico),
    }),
    updateDoc(referenciaGastoAtual, {
      "gasto atual": increment(valorNumerico),
    }),
  ]);
}

/**
 * Formata um número como moeda brasileira (R$ 1.234,56).
 *
 * Usa o Intl do JavaScript, suportado pelo Hermes (motor JS do React Native).
 *
 * @param {number} valor
 * @returns {string}
 */
export function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor ?? 0);
}
