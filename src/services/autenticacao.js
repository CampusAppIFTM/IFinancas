/**
 * src/services/autenticacao.js
 * ---------------------------------------------------------------------------
 * Camada de serviço: concentra TODA a conversa com o Google e com o Firebase.
 *
 * Por que isolar isto em um módulo?
 *   - As telas ficam sem saber que existe Firebase. Se amanhã a identidade
 *     migrar para um backend próprio, só este arquivo muda.
 *   - O código fica testável: dá para simular (mock) este módulo nos testes.
 *
 * FLUXO DA AUTENTICAÇÃO (vale desenhar no quadro):
 *   1. O app pede o login ao Google         -> GoogleSignin.signIn()
 *   2. O Google devolve um idToken          -> prova assinada de quem é o usuário
 *   3. O idToken vira uma credencial        -> GoogleAuthProvider.credential()
 *   4. A credencial faz login no Firebase   -> signInWithCredential()
 *   5. O Firebase emite a sessão do app     -> auth.currentUser (uid estável)
 *
 * O Google apenas IDENTIFICA o usuário; quem mantém a sessão do app é o
 * Firebase. É isso que permite proteger o Firestore, o Storage e uma API
 * própria, porque o token do Firebase pode ser verificado no servidor.
 * ---------------------------------------------------------------------------
 */
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "../../firebaseConfig";

/**
 * Configura a biblioteca do Google.
 *
 * O webClientId é o client ID do tipo "Web" gerado pelo Firebase (aparece no
 * google-services.json com o campo client_type 3). Sem ele o signIn até
 * funciona, mas NÃO devolve idToken -- e sem idToken não há login no Firebase.
 *
 * Chame esta função uma única vez, na inicialização do app.
 */
export function configurarGoogleSignin() {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    // offlineAccess: true, // só se o seu backend precisar de refresh token
  });
}

/**
 * Registra um observador do estado de autenticação.
 *
 * ESTE É O CORAÇÃO DA SOLUÇÃO. Em vez de a tela de login "devolver" o usuário,
 * quem avisa o app é o próprio Firebase. Isso resolve três casos de uma vez:
 *   - login (o callback recebe o usuário);
 *   - logout (o callback recebe null);
 *   - reabertura do app com sessão salva (o callback recebe o usuário guardado).
 *
 * @param {(usuario: import("firebase/auth").User | null) => void} callback
 * @returns {() => void} função que cancela a observação (usar no cleanup do useEffect)
 */
export function observarUsuario(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Executa o login com o Google e o converte em sessão do Firebase.
 *
 * @returns {Promise<{ cancelado: boolean }>}
 *   Repare que a função NÃO devolve o usuário: quem propaga o usuário para a
 *   interface é o observarUsuario(). Aqui só interessa saber se o fluxo foi
 *   concluído ou se o usuário desistiu.
 * @throws {Error} com a propriedade `code` preenchida em caso de falha real.
 */
export async function entrarComGoogle() {
  // Em aparelhos sem Google Play Services (alguns Android e emuladores sem
  // Play Store) o login é impossível. Verificar antes gera um erro claro.
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const resposta = await GoogleSignin.signIn();

  // MUDANÇA IMPORTANTE DA VERSÃO 13+ DA BIBLIOTECA:
  // desistir do login NÃO lança mais exceção -- a promise RESOLVE com
  // { type: "cancelled", data: null }. Códigos escritos para versões antigas
  // (que tratavam o cancelamento no catch) quebram silenciosamente aqui,
  // porque o objeto retornado é "truthy" e passa por qualquer if (usuario).
  if (resposta.type === "cancelled") {
    return { cancelado: true };
  }

  const idToken = resposta.data?.idToken;

  if (!idToken) {
    // Quase sempre significa webClientId ausente ou incorreto.
    throw new Error(
      "O Google não devolveu o idToken. Verifique o webClientId informado em configurarGoogleSignin()."
    );
  }

  const credencial = GoogleAuthProvider.credential(idToken);
  await signInWithCredential(auth, credencial);

  return { cancelado: false };
}

/**
 * Encerra a sessão.
 *
 * São DOIS logouts, e os dois são necessários:
 *   - GoogleSignin.signOut() esquece a conta escolhida no dispositivo (sem
 *     isso, o próximo login entra direto na mesma conta, sem perguntar);
 *   - signOut(auth) derruba a sessão do Firebase (sem isso, o usuário continua
 *     autenticado no backend).
 */
export async function sair() {
  await GoogleSignin.signOut();
  await signOut(auth);
}

/**
 * Traduz os códigos de erro da biblioteca para mensagens em português.
 * Manter isso em um único lugar evita repetir if/else em cada tela.
 */
export function descreverErro(erro) {
  switch (erro?.code) {
    case statusCodes.IN_PROGRESS:
      return "Já existe um login em andamento. Aguarde.";
    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
      return "Este dispositivo não possui o Google Play Services atualizado.";
    case statusCodes.SIGN_IN_CANCELLED:
      // Mantido por compatibilidade com versões anteriores à 13.
      return null; // null = não mostrar mensagem, o usuário desistiu
    default:
      return "Não foi possível entrar com o Google. Tente novamente.";
  }
}
