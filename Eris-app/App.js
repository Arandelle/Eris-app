import React, { useState,useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import LoginForm from "./src/component/LoginForm";
import SignupForm from "./src/component/SignupForm";
import TabNavigator from "./src/component/TabNavigator";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

const App = () => {
  const [isAuth, setAuth] = useState(false);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const value = await AsyncStorage.getItem('isAuth');
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
      await AsyncStorage.setItem('isAuth', JSON.stringify(auth));
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
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuth ? (
          <Stack.Screen name="TabNavigator" component={TabNavigator} />
        ) : (
          <>
            <Stack.Screen name="Login">
              {(props) => <LoginForm {...props} setAuth={handleAuth} />}
            </Stack.Screen>
            <Stack.Screen name="Signup" component={SignupForm} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;