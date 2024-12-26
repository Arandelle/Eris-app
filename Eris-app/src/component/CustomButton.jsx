import React from "react";
import { View, TouchableOpacity, Text } from "react-native";

const CustomButton = ({isValid, label, onPress}) => {
    
  return (
    <View className="p-4">
      <TouchableOpacity
        className={`p-3 w-full rounded-2xl ${
          !isValid ? "bg-gray-400" : "bg-blue-800"
        }`}
        onPress={onPress}
        disabled={!isValid}
      >
        <Text className="text-center text-lg font-extrabold text-white">
        {label}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustomButton;
