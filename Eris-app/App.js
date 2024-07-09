import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import LoginForm from "./src/component/LoginForm";
import SignupForm from "./src/component/SignupForm";
import TabNavigator from "./src/component/TabNavigator";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Login" component={LoginForm} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={SignupForm} />
        <Stack.Screen name="TabNavigator" component={TabNavigator}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;