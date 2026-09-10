/**
 * src/screens/HomeScreen.js
 * ---------------------------------------------------------------------------
 * Tela exibida quando existe um usuário autenticado.
 *
 * O objeto recebido é o User do Firebase, e não o perfil bruto do Google.
 * Campos disponíveis: uid, displayName, email, photoURL, emailVerified.
 *
 * O uid é o identificador que deve ser usado como chave dos dados do usuário
 * no Firestore -- ele não muda, mesmo que a pessoa troque o e-mail.
 * ---------------------------------------------------------------------------
 */
import { useState } from "react";
import { View, Text, Image, Button, StyleSheet } from "react-native";

import { sair } from "../services/autenticacao";

const HomeScreen = ({ usuario }) => {
  const [saindo, setSaindo] = useState(false);

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

  return (
    <View style={styles.container}>
      {/*
        photoURL pode ser null (contas sem foto). O operador ternário evita
        passar { uri: null } para o Image, que resulta em um quadro em branco.
      */}
      {usuario.photoURL ? (
        <Image style={styles.foto} source={{ uri: usuario.photoURL }} />
      ) : (
        <View style={[styles.foto, styles.fotoVazia]}>
          <Text style={styles.inicial}>
            {(usuario.displayName ?? "?").charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      {/* ?? cobre o caso de displayName ser null, não apenas undefined. */}
      <Text style={styles.nome}>Olá, {usuario.displayName ?? "usuário"}!</Text>
      <Text style={styles.email}>{usuario.email}</Text>
      <Text style={styles.uid}>uid: {usuario.uid}</Text>

      <View style={styles.botao}>
        <Button title="Sair" onPress={aoSair} disabled={saindo} />
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 24,
  },
  foto: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 24,
  },
  fotoVazia: {
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  inicial: {
    fontSize: 56,
    color: "#555",
  },
  nome: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: "#666",
  },
  uid: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
  },
  botao: {
    marginTop: 32,
    width: 200,
  },
});
