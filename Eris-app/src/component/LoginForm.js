import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  ScrollView,
  ToastAndroid,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from '@react-navigation/native';

const LoginForm = ({setAuth}) => {

  const navigation = useNavigation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleShowPass = () => {
    setShowPass(!showPass);
  };

  const handleLogin = () => {
    if (username === "user@gmail.com" && password === "123456"){
      navigation.navigate('TabNavigator');
      ToastAndroid.show('Login Successfully',
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM)
      setAuth(true);
    } else {
      Alert.alert('Invalid Credentials', 'Please try again', [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'OK', onPress: () => console.log('OK Pressed')},
      ]);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/background.jpg")}
      className="flex-1 justify-center w-full"
    >
      <View className="flex-1 justify-center items-center px-10">
        <View className="mb-5">
          <Image
            source={require("../../assets/logo.png")}
            className="h-24 w-24"
          />
        </View>
        <View className="w-full max-w-md">
          <Text className="text-center text-2xl mb-3">
            Welcome to Eris App!
          </Text>
          <View className="space-y-4">
            <View className="space-y-2">
              <Text className="text-lg">Username</Text>
              <View className="relative z-10">
                <View className="flex items-center absolute top-4 left-3 z-50">
                  <Icon name="alternate-email" size={20} color="black" />
                </View>
                <TextInput
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full ps-10 p-2.5 pl-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  onChangeText={setUsername}
                  value={username}
                  placeholder="Enter your username"
                  autoCapitalize="none"
                />
              </View>
            </View>
            <View className="space-y-2">
              <View className="flex flex-row items-center justify-between">
                <Text className="text-lg">Password</Text>
                <Text className="text-lg underline">Forget Password</Text>
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
                  <Icon
                    name={showPass ? "visibility" : "visibility-off"}
                    size={20}
                    color="black"
                  />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              className="w-full bg-blue-500 p-3 rounded"
              onPress={handleLogin}
            >
              <Text className="text-center text-lg text-white font-bold">
                Login
              </Text>
            </TouchableOpacity>
            <Text className="text-lg py-2 text-center">
              <TouchableOpacity onPress={()=>navigation.navigate('Signup')}>
                <Text className="underline">Don't have an account? Signup</Text>
              </TouchableOpacity>
            </Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default LoginForm;
