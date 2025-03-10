import { TextInput, Text, View } from "react-native";

const TextInputStyle = ({ label, placeholder, value, onChangeText, keyboardType}) => {
  return (
    <View className="space-y-2">
      <Text>{label}</Text>
      <TextInput
        className="w-full border border-gray-300 rounded-lg p-4 bg-white"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || "default"}
      />
    </View>
  );
};

export default TextInputStyle;
