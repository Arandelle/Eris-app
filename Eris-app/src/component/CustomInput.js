// components/CustomInput.js
import React from "react";
import { View, Text, TextInput } from "react-native";
import { Input } from "react-native-elements";

const CustomInput = ({ label, value, onChangeText, placeholder, errorMessage }) => {

  return (
    <View className="w-full space-y-2">
      <Text className="text-lg text-blue-800 font-bold">{label}</Text>
      <TextInput
       className={`bg-gray-50 border text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2 ${errorMessage ? "border-red-300" : "border-gray-300"}`}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        maxLength={(label === "Age" ? 2 : null)}
        keyboardType={(label === "Mobile phone" || label === "Age" ? "phone-pad" : "default" )}
      />
    <Text className="text-lg text-red-500">  {errorMessage}</Text>
    </View>
  );
};

export default CustomInput;
