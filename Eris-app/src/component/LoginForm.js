// LoginForm.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import SvgUri from 'react-native-svg';

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [text, setTextView] = useState("");
  const [showPass, setShowPass] =useState(false);

  const handleShowPass =()=>{
    setShowPass(!showPass);
  }

  const handleLogin = () => {
    Alert.alert("Login Successfully", `Welcome ${username}`, [
      { text: "Ok" },
      { text: "cancel" },
    ]);
  };

  return (
    <View className="flex h-full w-full justify-center bg-gray-100 dark:bg-gray-800 px-4">
      <View className="flex items-center justify-cente pb-5">
        <Image source={require('../../assets/logo.png')} className="z-50 h-24 w-24"/>
        </View>
      <View className="w-full px-6 max-w-md">
        <View className="space-y-1 mb-3">
          <Text className="text-center text-2xl">Welcome to Eris App!</Text>
        </View>

        <View className="space-y-4">
          <View className="space-y-2">
            <Text className="text-lg">Username</Text>
            <View className="space-y-2">
              <View className="relative">
                <Icon
                  name="alternate-email"
                  size={20}
                  color="black"
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    zIndex: 50,
                  }}
                />
                <TextInput
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 pl-10  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  onChangeText={setUsername}
                  value={username}
                  placeholder="Enter your username"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>

          <View className="space-y-2">
            <View className="flex flex-row items-center justify-between">
              <Text className="text-lg">Password</Text>
              <Text className="text-lg underline">Forget Password</Text>
            </View>
            <View className="relative">
              <View className="absolute top-3 left-3 z-50 flex items-center">
                <Icon name="lock" size={20} color="black" />
              </View>
              <TextInput
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 pl-10  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                onChangeText={setPassword}
                value={password}
                placeholder="Enter your password"
                secureTextEntry={!showPass}
              />
              <TouchableOpacity className="absolute right-4 top-4 flex items-center" onPress={handleShowPass}>
                <Icon name={showPass ? "visibility" : "visibility-off"} size={20} color="black" />
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <TouchableOpacity
              className="w-full bg-blue-500 p-4 rounded"
              onPress={handleLogin}
            >
              <Text className="text-center text-white text-bold">Login</Text>
            </TouchableOpacity>
            <Text className="text-lg py-2 text-center">Already have an account? <Text className="underline">Signup</Text></Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default LoginForm;
