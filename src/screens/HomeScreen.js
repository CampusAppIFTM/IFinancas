/**
 * src/screens/HomeScreen.js
 * ---------------------------------------------------------------------------
 * Tela inicial (Home) exibida quando existe um usuário autenticado.
 *
 * O objeto recebido é o User do Firebase, e não o perfil bruto do Google.
 * Campos disponíveis: uid, displayName, email, photoURL, emailVerified.
 *
 * O uid é o identificador que deve ser usado como chave dos dados do usuário
 * no Firestore -- ele não muda, mesmo que a pessoa troque o e-mail.
 * ---------------------------------------------------------------------------
 */
import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
} from "react-native";

import { sair } from "../services/autenticacao";
import { observarFinancas, formatarMoeda } from "../services/financas";

const HomeScreen = ({ usuario }) => {
  const [saindo, setSaindo] = useState(false);
  const [gastoAtual, setGastoAtual] = useState(0);
  const [gastos, setGastos] = useState([]);
  const [carregandoFinancas, setCarregandoFinancas] = useState(true);
  const [erroFinancas, setErroFinancas] = useState(null);

  /**
   * Assina o Firestore. O serviço escuta os DOIS documentos (gastoAtual e
   * ultimosgastos) e entrega tudo pronto em um único callback. O retorno do
   * useEffect cancela a escuta quando a tela é desmontada (sem isso o
   * listener ficaria vivo para sempre).
   */
  useEffect(() => {
    const cancelar = observarFinancas(
      ({ gastoAtual, lista }) => {
        setGastoAtual(gastoAtual);
        setGastos(lista);
        setCarregandoFinancas(false);
      },
      (erro) => {
        console.log("Falha ao ler finanças:", erro);
        setErroFinancas(
          "Não foi possível carregar seus dados. Verifique as regras do Firestore."
        );
        setCarregandoFinancas(false);
      }
    );

    return cancelar;
  }, []);

  const aoSair = async () => {
    setSaindo(true);
    try {
      await sair();
    } catch (e) {
      console.log("Falha ao sair:", e);
      setSaindo(false);
    }
    // Não desligamos o estado no caso de sucesso porque o componente será
    // desmontado pelo observador -- atualizar o estado depois disso gera aviso.
  };

  const inicial = (usuario.displayName ?? "?").charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1f5c3f" />

      {/* ---------- Cabeçalho ---------- */}
      <View style={styles.header}>
        <View style={styles.headerLogoRow}>
          <Image
            source={require('../../assets/logo-if.png')}
            style={styles.imagem}
            resizeMode="contain"
          />
          <Text style={styles.headerTitulo}>inanças</Text>
        </View>

        <View>
          {usuario.photoURL ? (
            <Image style={styles.avatar} source={{ uri: usuario.photoURL }} />
          ) : (
            <View style={[styles.avatar, styles.avatarVazio]}>
              <Text style={styles.avatarInicial}>{inicial}</Text>
            </View>
          )}
        </View>
      </View>

      {/* ---------- Card de gasto atual ---------- */}
      <View style={styles.cardGasto}>
        <Text style={styles.cardLabel}>Total Gasto:</Text>
        <Text style={styles.cardValor}>{formatarMoeda(gastoAtual)}</Text>
        <View style={styles.cardLinha} />
      </View>

      {/* ---------- Últimos gastos ---------- */}
      <View style={styles.secaoHeader}>
        <Text style={styles.secaoTitulo}>Ultimos gastos</Text>
        <TouchableOpacity>
          <Text style={styles.verTodas}>ver todas</Text>
        </TouchableOpacity>
      </View>

      {/* FlatList em vez de .map: o React Native virtualiza (renderiza só o
          que está na tela), então a rolagem continua lisa com muitos itens. */}
      <FlatList
        style={styles.listaGastos}
        data={gastos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listaConteudo}
        renderItem={({ item }) => (
          <View style={styles.itemGasto}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemDescricao}>{item.descricao}</Text>
              <Text style={styles.itemData}>{item.data}</Text>
            </View>
            <Text style={styles.itemValor}>{formatarMoeda(item.valor)}</Text>
          </View>
        )}
        ListEmptyComponent={
          carregandoFinancas ? (
            <Text style={styles.listaVazia}>Carregando...</Text>
          ) : erroFinancas ? (
            <Text style={styles.listaVazia}>{erroFinancas}</Text>
          ) : (
            <Text style={styles.listaVazia}>
              Nenhum lançamento ainda. Registre seu primeiro gasto!
            </Text>
          )
        }
      />

      {/* ---------- Barra de navegação inferior ---------- */}
      <View style={styles.tabBar}>
        <TabItem label="Início" ativo />

        <TouchableOpacity
          style={styles.botaoSair}
          onPress={aoSair}
          disabled={saindo}
        >
          <Text style={styles.botaoSairTexto}>
            {saindo ? "Saindo..." : "Sair"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const TabItem = ({ label, ativo }) => (
  <TouchableOpacity style={styles.tabItem}>
    <Text style={[styles.tabLabel, ativo && styles.tabLabelAtivo]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default HomeScreen;

const VERDE = "#1f5c3f";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // Cabeçalho
  header: {
    backgroundColor: VERDE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 28,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  headerLogoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  imagem: {
    width: 30,
    height: 30,
    marginRight: 0,
  },
  headerTitulo: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginTop:6,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarVazio: {
    backgroundColor: "#3f7a5c",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInicial: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  // Card de gasto atual
  cardGasto: {
    marginHorizontal: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: VERDE,
    borderRadius: 14,
    padding: 18,
    backgroundColor: "#f7fbf8",
  },
  cardLabel: {
    fontSize: 15,
    color: "#333",
    marginBottom: 6,
  },
  cardValor: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 12,
  },
  cardLinha: {
    height: 1,
    backgroundColor: VERDE,
    opacity: 0.5,
  },

  // Seção "Últimos gastos"
  secaoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 40,
  },
  secaoTitulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: VERDE,
  },
  verTodas: {
    fontSize: 14,
    color: "#4a90d9",
  },

  listaGastos: {
    marginHorizontal: 20,
    marginTop: 16,
    flexGrow: 0, // impede a FlatList de roubar todo o espaço vertical
  },
  listaConteudo: {
    paddingBottom: 16,
  },
  listaVazia: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 12,
  },
  itemGasto: {
    minHeight: 56,
    borderRadius: 10,
    backgroundColor: "#f2f2f2",
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemInfo: {
    flex: 1,
    marginRight: 10,
  },
  itemDescricao: {
    fontSize: 15,
    fontWeight: "500",
    color: "#222",
  },
  itemData: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  itemValor: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#c0392b", // vermelho: é sempre gasto
  },

  // Barra de navegação inferior
  tabBar: {
    marginTop: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 22,
    paddingHorizontal: 32,
    backgroundColor: "#f0f0f0",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  tabItem: {
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  tabLabelAtivo: {
    color: VERDE,
    fontWeight: "bold",
  },
  botaoSair: {
    backgroundColor: "#2f9e63",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 10,
  },
  botaoSairTexto: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
}); 