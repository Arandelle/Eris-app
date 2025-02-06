import { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ToastAndroid,
  ImageBackground,
  Image,
  ScrollView,
} from "react-native";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInAnonymously,
} from "firebase/auth";
import { ref, get, set, serverTimestamp } from "firebase/database";
import { auth, database } from "../services/firebaseConfig";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import ForgotPass from "./ForgotPass";
import { generateUniqueBarangayID } from "../helper/generateID";
import colors from "../constant/colors";
import useSendNotification from "../hooks/useSendNotification";
import ErrorMessages from "../helper/ErrorMessages";
import { OfflineContext } from "../context/OfflineContext";

const LoginForm = () => {
  const navigation = useNavigation();
  const {sendNotification} = useSendNotification()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isPromptVisible, setPromptVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const {isOffline, saveOfflineData} = useContext(OfflineContext);

  useEffect(() => {
    if(isOffline){
      Alert.alert("Offline mode", "Please check your  network!");
    }
  }, []);

  useEffect(() => {
    const randomNumber = Math.floor(Math.random() * 5) + 1;
    const url = `https://flowbite.com/docs/images/people/profile-picture-${randomNumber}.jpg`;
    setImageUrl(url);
  }, []);

  const handleShowPass = () => {
    setShowPass(!showPass);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }
    setLoading(true);
    try {
      // Sign in the user
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (user.emailVerified) {
        // Fetch the user data from Firebase Realtime Database using UID
        const userRef = ref(database, `users/${user.uid}`);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          ToastAndroid.show(
            "Login Successfully",
            ToastAndroid.SHORT,
            ToastAndroid.BOTTOM
          );
        } else {
          Alert.alert("Error", "User data not found in the database");
          await auth.signOut();
        }
      } else {
        Alert.alert("Error", "Email is not verified");
        await auth.signOut();
      }
    } catch (error) {
      ErrorMessages(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    if (loading) return;

    try {
      setLoading(true);

      // Sign in anonymously
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      const userId = await generateUniqueBarangayID("user");

      // Create a basic profile for anonymous user
      const userRef = ref(database, `users/${user?.uid}`);
      await set(userRef, {
        customId: userId,
        profileComplete: false,
        createdAt: new Date().toISOString(),
        timestamp: serverTimestamp(),
        img: imageUrl,
      });

      console.log("Anonymous user created:", user?.uid);

      navigation.navigate("ERIS");
      ToastAndroid.show(
        "Logged in as guest user",
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
      const adminId = "7KRIOXYy6QTW6QmnWfh9xqCNL6T2";
      await sendNotification("admins", adminId, "userGuest", user?.uid);
      await sendNotification("users", user?.uid, "welcomeGuest");

    } catch (error) {
      console.error("Anonymous login error:", error);
      ErrorMessages(error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setPromptVisible(true);
  };

  const handlePasswordReset = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Success", "Password reset email sent");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/background.jpg")}
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
       <View className="flex-1 justify-between min-h-full">
          <View className="space-y-10">
            <View className="flex items-center mt-20">
              <Image
                source={require("../../assets/logo.png")}
                className="h-24 w-24"
              />
            </View>
            <View className="flex items-center">
              <View className="w-full max-w-sm">
              {isOffline && <Text style={{ color: 'red' }}>⚠️ You are offline! Data will stored locally and sync once online</Text>}
                <Text className="text-center text-2xl text-blue-800 font-bold mb-3">
                  Welcome to Eris App!
                </Text>
                <View className="space-y-4">
                  <View className="space-y-2">
                    <Text className="text-lg">Email</Text>
                    <View className="relative z-10">
                      <View className="flex items-center absolute top-4 left-3 z-50">
                        <Icon name="email" size={20} color={colors.blue[800]} />
                      </View>
                      <TextInput
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full ps-10 p-2.5 pl-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        onChangeText={setEmail}
                        value={email}
                        placeholder="Enter your email"
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                    </View>
                  </View>
                  <View className="space-y-2">
                    <View className="flex flex-row items-center justify-between">
                      <Text className="text-lg">Password</Text>
                      <TouchableOpacity onPress={handleForgotPassword}>
                        <Text className="text-lg underline">
                          Forgot Password?
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {/** Password Input */}
                    <View className="relative z-10">
                      <View className="flex items-center absolute top-4 left-3 z-50">
                        <Icon name="lock" size={20} color={colors.blue[800]} />
                      </View>
                      <TextInput
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full ps-10 p-2.5 pl-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        onChangeText={setPassword}
                        value={password}
                        placeholder="Enter your password"
                        secureTextEntry={!showPass}
                      />
                      <TouchableOpacity
                        className="absolute right-4 top-4 flex items-center"
                        onPress={handleShowPass}
                      >
                        <Icon
                          name={showPass ? "eye" : "eye-off"}
                          size={20}
                          color={colors.blue[800]}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {/** Login button */}
                  <TouchableOpacity
                    className="w-full bg-blue-800 p-3 rounded-lg flex flex-row items-center justify-center space-x-4"
                    onPress={handleLogin}
                    disabled={loading}
                  >
                    <Icon name="login" size={20} color={"white"} />
                    <Text className="text-center text-lg text-white font-bold">
                      {loading ? "Logging in..." : "Login"}
                    </Text>
                  </TouchableOpacity>
  
                  {/* Guest login button */}
                  <TouchableOpacity
                    className="w-full bg-gray-50 border border-gray-300 p-3 rounded-lg flex flex-row items-center justify-center space-x-4"
                    onPress={handleAnonymousLogin}
                    disabled={loading}
                  >
                    <Icon name="account-circle" size={20} color={colors.blue[800]} />
                    <Text className="text-center text-lg text-blue-800 font-bold">
                      {loading ? "Please wait..." : "Continue as Guest"}
                    </Text>
                  </TouchableOpacity>
  
                  {/* <TouchableOpacity
                    className="w-full bg-white border-2 border-blue-800 p-3 rounded flex flex-row items-center justify-center space-x-4"
                    onPress={() => navigation.navigate("Phone")}
                    disabled={loading}
                  >
                  <Icon name="incognito" size={20} color={colors.blue[800]} />
                    <Text className="text-center text-lg text-blue-800 font-bold">
                      {loading ? "Please wait..." : "Login Phone"}
                    </Text>
                  </TouchableOpacity> */}
  
                  <ForgotPass
                    visible={isPromptVisible}
                    onClose={() => setPromptVisible(false)}
                    onSubmit={handlePasswordReset}
                  />
                </View>
              </View>
            </View>
          </View>
  
            <View className="flex flex-col items-center justify-center space-x-2 p-2">
              <Text className="text-lg">Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                <Text className="text-blue-500 underline font-bold text-lg">
                  Create an account
                </Text>
              </TouchableOpacity>
            </View>

       </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default LoginForm;
