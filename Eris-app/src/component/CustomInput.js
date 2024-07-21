// components/CustomInput.js
import React from "react";
import { View, Text, TextInput } from "react-native";

const CustomInput = ({ label, value, onChangeText, placeholder }) => {
  return (
    <View className="w-full mb-4">
      <Text className="text-lg mb-1">{label}</Text>
      <TextInput
        className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
      />
    </View>
  );
};

export default CustomInput;
