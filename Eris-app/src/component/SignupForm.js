import React, { useState } from "react";
import { View, Text, Image, TextInput, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const SignupForm = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [createType, setCreateType] = useState(false);
  const [isChecked, setChecked] = useState(false);

  const toggleCheckbox = () => {
    setChecked(!isChecked);
  };
  const handleShowPass = () => {
    setShowPass(!showPass);
  };

  const handleCreateAccount = () => {
    setCreateType(!createType);
  };

  const email = "text-blue-500";
  const pass = "text-gray-400";

  return (
    <View className="flex items-center">
      <View className="w-full max-w-sm mt-10">
        <View className="space-y-4 flex justify-between">
          <View className="flex flex-row space-x-6">
            <TouchableOpacity onPress={() => handleCreateAccount()}>
              <Text
                className={`text-xl ${createType ? email : pass} ${
                  createType ? "border-b-2 pb-0.5 border-blue-500" : ""
                } font-extrabold`}
              >
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleCreateAccount()}>
              <Text
                className={`text-xl ${createType ? pass : email} ${
                  !createType ? "border-b-2 pb-0.5 border-blue-500" : ""
                } font-extrabold`}
              >
                Phone
              </Text>
            </TouchableOpacity>
          </View>
          <View className="space-y-2">
            <Text className="text-lg">{createType ? "Email" : "Phone"}</Text>
            <View className="relative z-10">
              <View className="flex items-center absolute top-4 left-3 z-50">
                <Icon
                  name={createType ? "email" : "call"}
                  size={20}
                  color="black"
                />
              </View>
              <TextInput
                className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full ps-10 p-2.5 pl-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                onChangeText={setUsername}
                value={username}
                placeholder={`${
                  createType ? "user@gmail.com" : "0 9 x x - x x x x - x x x"
                }`}
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
                placeholder="Type your password"
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
            <View className="py-3">
              <TouchableOpacity
                className="flex flex-row items-center"
                onPress={toggleCheckbox}
              >
                <View
                  className={`w-5 h-5 mr-2 border-[1px] rounded-md border-gray-300 bg-white ${
                    isChecked && "bg-blue-400"
                  }`}
                ></View>
                <Text className="text-md">
                  I have read and agree to Eris'{" "}
                  <Text className="text-blue-600">Terms of Service</Text> and
                 <Text className="text-blue-600"> Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity className="w-full bg-blue-500 p-3 rounded">
            <Text className="text-center text-lg text-white font-bold">
              Signup
            </Text>
          </TouchableOpacity>

          {/* <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text className="underline text-lg text-center">Already have an account? Login</Text>
            </TouchableOpacity> */}
        </View>
      </View>
    </View>
  );
};

export default SignupForm;
