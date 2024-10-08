import React, { useState } from "react";
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
} from "firebase/auth";
import { ref, get } from "firebase/database"; // Import Firebase Realtime Database functions
import { auth, database } from "../services/firebaseConfig"; // Ensure you have both auth and database imports
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import ForgotPass from "./ForgotPass";

const LoginForm = () => {
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isPromptVisible, setPromptVisible] = useState(false);
  const [loading, setLoading] = useState(false);

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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.emailVerified) {
        // Fetch the user data from Firebase Realtime Database using UID
        const userRef = ref(database, `users/${user.uid}`);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          // You can now use the userData as needed, e.g., storing in context or state
          console.log("User Data:", userData);

          navigation.navigate("TabNavigator");
          ToastAndroid.show("Login Successfully", ToastAndroid.SHORT, ToastAndroid.BOTTOM);
        } else {
          Alert.alert("Error", "User data not found in the database");
          await auth.signOut();
        }
      } else {
        Alert.alert("Error", "Email is not verified");
        await auth.signOut();
      }
    } catch (error) {
      Alert.alert("Login Error", error.message);
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
      <ScrollView>
        <View className="flex items-center mt-20">
          <View className="mb-5">
            <Image source={require("../../assets/logo.png")} className="h-24 w-24" />
          </View>
        </View>
        <View className="flex items-center mt-20">
          <View className="w-full max-w-sm">
            <Text className="text-center text-2xl mb-3">Welcome to Eris App!</Text>
            <View className="space-y-4">
              <View className="space-y-2">
                <Text className="text-lg">Email</Text>
                <View className="relative z-10">
                  <View className="flex items-center absolute top-4 left-3 z-50">
                    <Icon name="alternate-email" size={20} color="black" />
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
                    <Text className="text-lg underline">Forgot Password?</Text>
                  </TouchableOpacity>
                </View>
                <View className="relative z-10">
                  <View className="flex items-center absolute top-4 left-3 z-50">
                    <Icon name="lock" size={20} color="black" />
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
                    <Icon name={showPass ? "visibility" : "visibility-off"} size={20} color="black" />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                className="w-full bg-blue-500 p-3 rounded"
                onPress={handleLogin}
                disabled={loading}
              >
                <Text className="text-center text-lg text-white font-bold">
                  {loading ? "Logging in..." : "Login"}
                </Text>
              </TouchableOpacity>
              <Text className="text-lg py-2 text-center">
                <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                  <Text className="underline text-lg">
                    Don't have an account? Signup
                  </Text>
                </TouchableOpacity>
              </Text>
              <ForgotPass
                visible={isPromptVisible}
                onClose={() => setPromptVisible(false)}
                onSubmit={handlePasswordReset}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default LoginForm;
