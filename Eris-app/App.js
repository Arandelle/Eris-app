import { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginForm from "./src/screens/LoginForm";
import SignupForm from "./src/screens/SignupForm";
import DrawerNavigator from "./src/navigation/DrawerNavigator";
import TabNavigator from "./src/navigation/TabNavigator";
import { Text, TouchableOpacity, View, Alert, Image } from "react-native";
import UpdateProfile from "./src/screens/UpdateProfile";
import { auth, database } from "./src/services/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { get, ref } from "firebase/database";
import { useNavigation } from "@react-navigation/native";
import Logo from "./assets/logo.png";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import TopBarNavigator from "./src/navigation/TopBarNavigator";
import ScrollViewScreen from "./src/screens/ScrollViewScreen";
import PhoneAuth from "./src/screens/PhoneAuth";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.isAnonymous) {
          // Directly set the user as anonymous without a database check
          setUser(user);
        } else if (user.emailVerified) {
          try {
            const userRef = ref(database, `users/${user.uid}`);
            const userSnapshot = await get(userRef);
            
            console.log(`User snapshot exists: ${userSnapshot.exists()}`);
            if (userSnapshot.exists()) {
              setUser(user);
            } else {
              await signOut(auth);
              setUser(null);
              Alert.alert("Error", "User data not found");
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            await signOut(auth);
            setUser(null);
            Alert.alert("Error", "Account is not found");
          }
        }
      } else {
        // Reset the user when there is no authenticated user
        setUser(null);
      }
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);
  

  if (loading) {
    return (
      <View className="flex w-full h-full items-center justify-center">
        <Image source={Logo} alt="Loading..." />
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
        {user ? (
            <>
              <Stack.Screen
                name="ERIS"
                options={{ headerShown: false }}
                component={TabNavigator}
              />
              <Stack.Screen
                name="Emergency Records"
                component={TopBarNavigator}
                options={{
                  headerShown: true
                }}
              />
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
                      <Icon name="arrow-left-thick" size={25} color={"blue"} />
                    </TouchableOpacity>
                  ),
                })}
              />
            </>
          ) : (
          <>
          {/* <Stack.Screen
                name="Phone"
                options={{ headerShown: false }}
                component={PhoneAuth}
              /> */}
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
