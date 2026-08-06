import { StyleSheet, Text, View, Button, ActivityIndicator, Image } from "react-native";
import { useState } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

//funções de autenticação
export const onLogin = async () => {
  const user = await GoogleSignin.signIn();
  return user;
};

export const onLogout = async () => {
  return await GoogleSignin.signOut();
};

GoogleSignin.configure({
  webClientId: "676797397237-pjipptjgb1nuaomvcm6rd6dpt19jl06n.apps.googleusercontent.com",
});

// Telas
const LoginScreen = ({ login }) => {
  const [isSigninInProgress, setIsSigninInProgress] = useState(false);

  return (
    <View style={styles.layout}>
      {isSigninInProgress && <ActivityIndicator />}
      <Text style={styles.title}>Login</Text>
      <Button
        title="entrar"
        onPress={() => {
          setIsSigninInProgress(true);
          onLogin().then((user) => {
            console.log(user);
            login(user);
          });
        }}
      />
    </View>
  );
};

const HomeScreen = ({ user, login }) => (
  <View style={styles.layout}>
    <Text style={styles.title}>Home</Text>
    <Image
      style={{ width: 300, height: 300 }}
      source={{
        uri: user.user.photo,
      }}
    />
    <Button title="Sair" onPress={() => onLogout().then(() => login(false))} />
  </View>
);

const App = () => {
  const [user, setUser] = useState(false);
  return <View style={styles.container}>{user ? <HomeScreen user={user} login={setUser} /> : <LoginScreen login={setUser} />}</View>;
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  layout: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    marginBottom: 16,
  },
});