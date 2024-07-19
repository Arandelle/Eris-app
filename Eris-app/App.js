import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginForm from "./src/component/LoginForm";
import SignupForm from "./src/component/SignupForm";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DrawerNavigator from "./src/component/DrawerNavigator";
import TabNavigator from "./src/component/TabNavigator";
import {Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const Stack = createNativeStackNavigator();

const LoginButton = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={() => navigation.navigate("Login")}>
      <Text className="text-blue-600 font-extrabold text-lg">Login</Text>
    </TouchableOpacity>
  );
};

const App = () => {

  const [isAuth, setAuth] = useState(false);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const value = await AsyncStorage.getItem("isAuth");
        if (value !== null) {
          setAuth(JSON.parse(value));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleAuth = async (auth) => {
    try {
      await AsyncStorage.setItem("isAuth", JSON.stringify(auth));
      setAuth(auth);
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false,
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontWeight: '900',
          fontSize: 24,
        }}}
      >
        {isAuth ? (
          <>
            <Stack.Screen name="ERIS" options={{ headerShown: false }}>
              {(props) => <TabNavigator {...props} setAuth={handleAuth} />}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen name="Login">
              {(props) => <LoginForm {...props} setAuth={handleAuth} />}
            </Stack.Screen>
            <Stack.Screen
              name="Signup"
              component={SignupForm}
              options={{
                headerShown: true,
                title: "Create your account",
                headerRight: ()=> <LoginButton />
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
