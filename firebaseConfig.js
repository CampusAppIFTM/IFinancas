/**
 * firebaseConfig.js
 * ---------------------------------------------------------------------------
 * Inicializa o Firebase, o serviço de autenticação E o Firestore.
 *
 * PONTO DE ATENÇÃO (o mais esquecido em React Native):
 * getAuth() guarda a sessão APENAS EM MEMÓRIA. Ao fechar e reabrir o app, o
 * usuário aparece deslogado. Para persistir a sessão no dispositivo é preciso
 * usar initializeAuth() informando explicitamente o AsyncStorage.
 *
 * Dependências:
 *   npx expo install firebase @react-native-async-storage/async-storage
 * ---------------------------------------------------------------------------
 */
import { getApps, getApp, initializeApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Estes valores vêm do console do Firebase (Configurações do projeto > Seus apps).
// Não são segredos, mas mantê-los em variáveis de ambiente evita commitá-los
// por engano e facilita trocar de projeto (desenvolvimento / produção).
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Inicialização IDEMPOTENTE: este módulo pode ser reexecutado pelo Fast
 * Refresh durante o desenvolvimento. Sem as checagens abaixo, rodar
 * initializeApp/initializeAuth uma segunda vez lançaria os erros
 * "app/duplicate-app" e "auth/already-initialized".
 */
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

/**
 * getApps()/getApp() reutilizam o app existente; no auth, o try/catch é
 * necessário porque initializeAuth lança auth/already-initialized se o
 * serviço de auth já tiver sido criado nesta sessão do Metro.
 */
function criarAuth(aplicativo) {
  try {
    return initializeAuth(aplicativo, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Já existe uma instância de auth para este app -> reutiliza.
    return getAuth(aplicativo);
  }
}

export const auth = criarAuth(app);

/**
 * Instância do Firestore (banco de dados).
 *
 * Os documentos viverão na coleção "financas", e cada documento terá um campo
 * `uid` com o dono. É isso que permite uma regra de segurança do tipo:
 *
 *   match /financas/{doc} {
 *     allow read, write: if request.auth.uid == resource.data.uid;
 *   }
 *
 * Sem esse campo, seria impossível escrever uma regra que iscole os dados de
 * cada usuário (resource.data não teria como indicar o dono).
 * A função getFirestore() é idempotente: se a instância já existe para este
 * app, ela devolve a mesma (não lança erro), ao contrário de
 * initializeFirestore(). Isso torna o módulo seguro sob Fast Refresh.
 */
export const db = getFirestore(app);
