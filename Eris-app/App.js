import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginForm from "./src/screens/LoginForm";
import SignupForm from "./src/screens/SignupForm";
import DrawerNavigator from "./src/navigation/DrawerNavigator";
import TabNavigator from "./src/navigation/TabNavigator";
import { Text, TouchableOpacity, View, Alert, Image} from "react-native";
import UpdateProfile from "./src/screens/UpdateProfile";
import { auth } from "./src/services/firebaseConfig";
import {onAuthStateChanged} from "firebase/auth"
import {get, getDatabase, ref} from "firebase/database"
import {useNavigation} from "@react-navigation/native"
import Logo from "./assets/logo.png"

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
  const [user, setUser] = useState(null);
  const [isResponder, setIsResponder] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const db = getDatabase();
        const adminRef = ref(db, `users/${user.uid}`);
        
        try {
          const adminSnapshot = await get(adminRef);
          console.log(`Admin snapshot exists: ${adminSnapshot.exists()}`);
          setIsResponder(adminSnapshot.exists());
        } catch (error) {
          console.error('Error fetching admin data:', error);
          Alert.alert("Error", "Account is not found")
        }
      } else {
        setUser(null);
        setIsResponder(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View className="flex w-full h-full items-center justify-center">
       <Image source={Logo} alt="Loading..."/>
       <Text>Loading please wait...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontWeight: "900",
            fontSize: 24,
          },
        }}
      >
        {isResponder && user ? (
          <>
            <Stack.Screen name="ERIS" options={{ headerShown: false }} component={TabNavigator} />
            <Stack.Screen
              name="UpdateProfile"
              component={UpdateProfile}
              options={({ navigation }) => ({
                title: "Update your profile",
                headerShown: true,
                headerLeft: () => (
                  <TouchableOpacity
                    onPress={() => navigation.navigate("Profile")}
                  >
                    <Text className="text-2xl">{`<`}</Text>
                  </TouchableOpacity>
                ),
              })}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginForm} />
            <Stack.Screen
              name="Signup"
              component={SignupForm}
              options={{
                headerShown: true,
                title: "Create your account",
                headerRight: () => <LoginButton />,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
