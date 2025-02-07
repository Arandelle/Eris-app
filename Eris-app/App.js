import { useState, useEffect, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginForm from "./src/screens/LoginForm";
import SignupForm from "./src/screens/SignupForm";
import DrawerNavigator from "./src/navigation/DrawerNavigator";
import TabNavigator from "./src/navigation/TabNavigator";
import { Text, View, Alert, Image } from "react-native";
import UpdateProfile from "./src/screens/UpdateProfile";
import { auth, database } from "./src/services/firebaseConfig";
import {
  onAuthStateChanged,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { get, ref } from "firebase/database";
import Logo from "./assets/logo.png";
import TopBarNavigator from "./src/navigation/TopBarNavigator";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Clearance from "./src/screens/Clearance";
import ChangePassModal from "./src/screens/ChangePassModal";
import PhoneSignin from "./src/screens/PhoneSignin";
import { OfflineContext, OfflineProvider } from "./src/context/OfflineContext";
import OfflineMode from "./src/screens/OfflineMode";

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <OfflineProvider>
      <MainAppp />
    </OfflineProvider>
  );
};

// create new component to call the OfflineContext before OfflineProvider
const MainAppp = () => {
  const { isOffline, saveStoredData, storedData } = useContext(OfflineContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.isAnonymous) {
          // Directly set the user as anonymous without a database check
          setUser(user);
          saveStoredData("users", user);
        } else {
          try {
            const userRef = ref(database, `users/${user?.uid}`);
            const userSnapshot = await get(userRef);

            if (userSnapshot.exists()) {
              setUser(user); //set user which is for the auth user (verified)
              saveStoredData("users", user); // save the user to the async storage
              if (!user.emailVerified) {
                // this will trigger when it is anonymous adding email (not yet verified)
                Alert.alert(
                  "Email verification Pending",
                  "Please verify your email address. Check your inbox for verification link",
                  [
                    {
                      text: "Resend Email",
                      onPress: () => sendEmailVerification(user),
                    },
                    {
                      text: "Remind me later",
                      style: "cancel",
                    },
                  ]
                );
              }
            } else {
              //if no user data found on database
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
    <GestureHandlerRootView style={{ flex: 1 }}>
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
          {user || (isOffline && storedData.user) ? (
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
                  headerShown: true,
                }}
              />
              <Stack.Screen
                name="Clearance"
                component={Clearance}
                options={{
                  headerShown: true,
                  headerTitle: "Clearance Form",
                }}
              />
              <Stack.Screen
                name="ChangePassword"
                component={ChangePassModal}
                options={{
                  headerShown: true,
                  headerTitle: "Change Password",
                }}
              />

              <Stack.Screen
                name="UpdateProfile"
                component={UpdateProfile}
                options={() => ({
                  title: "Update your profile",
                  headerShown: true,
                })}
              />
            </>
          ) : isOffline ? (
            <Stack.Screen name="OfflineMode" component={OfflineMode} />
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginForm} />
              <Stack.Screen
                name="Signup"
                component={SignupForm}
                options={{
                  headerShown: true,
                  title: "Create your account",
                }}
              />
              <Stack.Screen
                name="Phone"
                options={{ headerShown: false }}
                component={PhoneSignin}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;
