/**
 * src/screens/LoginScreen.js
 * ---------------------------------------------------------------------------
 * Tela de login.
 *
 * Observe o que ela NÃO faz:
 *   - não conhece o Firebase;
 *   - não recebe uma prop para "avisar" quem entrou.
 * Ela apenas dispara o login e cuida do próprio estado visual (carregando e
 * mensagem de erro). Quando o login dá certo, o observador em App.js troca a
 * tela sozinho.
 * ---------------------------------------------------------------------------
 */
import { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";

import { entrarComGoogle, descreverErro } from "../services/autenticacao";

const LoginScreen = () => {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const aoPressionar = async () => {
    setErro(null);
    setCarregando(true);

    try {
      await entrarComGoogle();
      // Se deu certo, não fazemos nada aqui: o onAuthStateChanged assume.
      // Se o usuário cancelou, também não fazemos nada -- ele continua na tela.
    } catch (e) {
      console.log("Falha no login:", e);
      setErro(descreverErro(e));
    } finally {
      // O finally garante que o indicador SEMPRE é desligado, tenha o login
      // dado certo, falhado ou sido cancelado. Esquecer isto é o motivo mais
      // comum de um botão que "trava" carregando para sempre.
      setCarregando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Minha Agenda</Text>
      <Text style={styles.subtitulo}>Entre para continuar</Text>

      {/*
        GoogleSigninButton é o botão oficial. Além de pronto, ele atende às
        diretrizes de marca do Google, exigidas para publicar na loja.
        O disabled evita o erro IN_PROGRESS por toque duplo.
      */}
      <GoogleSigninButton
        style={styles.botaoGoogle}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={aoPressionar}
        disabled={carregando}
      />

      {/* Área reservada com altura fixa: evita a tela "pular" ao aparecer. */}
      <View style={styles.areaAviso}>
        {carregando && <ActivityIndicator />}
        {erro && <Text style={styles.erro}>{erro}</Text>}
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 24,
  },
  titulo: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
  },
  botaoGoogle: {
    width: 240,
    height: 48,
  },
  areaAviso: {
    height: 48,
    justifyContent: "center",
  },
  erro: {
    color: "#c62828",
    textAlign: "center",
  },
});
