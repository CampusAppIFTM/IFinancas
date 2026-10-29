/**
 * metro.config.js
 * ---------------------------------------------------------------------------
 * Configuração do Metro (o bundler do React Native).
 *
 * POR QUE ESTE ARQUIVO EXISTE (problema do Firebase + Expo SDK 53+):
 * A partir do SDK 53, o Metro resolve imports usando o mapa "exports" do
 * package.json (ES Module resolution). O pacote "firebase" publica builds ESM
 * e CJS do mesmo módulo. Com isso, dependendo de como cada arquivo importa,
 * o Metro podia incluir DUAS cópias do SDK no bundle. Consequências reais:
 *
 *   - "FirebaseError: Expected first argument to collection() to be a
 *     CollectionReference, a DocumentReference or FirebaseFirestore"
 *     (o db da cópia A não passa no teste de instanceof da cópia B);
 *   - "FirebaseError: Firebase: Error (auth/already-initialized)".
 *
 * Desativar unstable_enablePackageExports faz o Metro usar a resolução
 * clássica (campos "main" / "react-native" do package.json), que aponta para
 * UM arquivo por plataforma. Todas as cópias passam a ser a mesma instância.
 *
 * Documentação do Expo:
 * https://docs.expo.dev/versions/latest/config/metro/#es-module-resolution
 * ---------------------------------------------------------------------------
 */
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = false;

module.exports = config;
