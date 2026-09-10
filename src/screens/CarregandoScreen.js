/**
 * src/screens/CarregandoScreen.js
 * ---------------------------------------------------------------------------
 * Tela exibida enquanto o Firebase verifica se existe uma sessão salva.
 *
 * Sem ela, o app mostraria a tela de login por uma fração de segundo antes de
 * pular para a Home -- o clássico "piscar" de aplicativos mal resolvidos.
 * ---------------------------------------------------------------------------
 */
import { View, ActivityIndicator, StyleSheet } from "react-native";

const CarregandoScreen = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" />
  </View>
);

export default CarregandoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
});
