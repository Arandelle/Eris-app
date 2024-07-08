import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Button, Text } from "react-native";
import LoginForm from "./src/component/LoginForm";
import SignupForm from "./src/component/SignupForm";

const Stack = createNativeStackNavigator();

const App = () => {
  return ( 

  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginForm} options={{headerShown: false}}/>
      <Stack.Screen name="Signup" component={SignupForm}/>
    </Stack.Navigator>
  </NavigationContainer>

  );
};

export default App;
