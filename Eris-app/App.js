import React from "react";
import { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import LoginForm from "./src/component/LoginForm";
import SignupForm from "./src/component/SignupForm";
import Home from "./src/component/Home";
import Footer from "./src/component/Footer";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const App = () => {
  const [isAuthenticated, setAuth] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginForm} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={SignupForm} />
        <Stack.Screen name="Home" component={Footer}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;