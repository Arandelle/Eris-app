import React from 'react'
import { View, Text } from 'react-native';
import { Picker } from "@react-native-picker/picker";

const PickerField = ({ label, selectedValue, onValueChange, items }) => {
    return (
        <View className="space-y-4">
        <Text>{label}</Text>
        <View className="bg-gray-50 border text-gray-900 rounded-lg w-full border-gray-300">
          <Picker
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            style={{ height: 50 }}
          >
            {items.map((item) => (
              <Picker.Item
                key={item.value}
                label={item.label}
                value={item.value}
              />
            ))}
          </Picker>
        </View>
      </View>
    );
};

export default PickerField
