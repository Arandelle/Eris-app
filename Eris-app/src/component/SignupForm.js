import React, { useState } from 'react'
import { View,Text, Image, TextInput, TouchableOpacity} from 'react-native'
import Icon from "react-native-vector-icons/MaterialIcons";

const SignupForm = ({navigation}) => {
  const [username, setUsername]  = useState("");
  const [password, setPassword]  = useState("");
  const [showPass, setShowPass]  = useState(false);

  const handleShowPass =()=>{
    setShowPass(!showPass);
  }

  return (
    <View className="flex items-center">
    <View className="w-full max-w-sm mt-10">
      <View className="space-y-4">
        <View className="space-y-2">
          <Text className="text-lg">Email</Text>
          <View className="relative z-10">
            <View className="flex items-center absolute top-4 left-3 z-50">
              <Icon name="alternate-email" size={20} color="black" />
            </View>
            <TextInput
              className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full ps-10 p-2.5 pl-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChangeText={setUsername}
              value={username}
              placeholder="Enter your email"
              autoCapitalize="none"
            />
          </View>
        </View>
        <View className="space-y-2">
          <View className="flex flex-row items-center justify-between">
            <Text className="text-lg">Password</Text>
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
        >
          <Text className="text-center text-lg text-white font-bold">
            Signup
          </Text>
        </TouchableOpacity>
        <Text className="text-lg py-2 text-center">
          <TouchableOpacity onPress={()=> navigation.navigate('Login')}>
            <Text className="underline">Already have an accouont? Login</Text>
          </TouchableOpacity>
        </Text>
      </View>
    </View>
  </View>
  )
}

export default SignupForm
