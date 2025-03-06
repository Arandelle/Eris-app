import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

const ImmediateEmergency = ({ isBellSwipe, setIsBellSwipe,handleConfirmReport,emergencyType, setEmergencyType}) => {

  const list = ["medical", "fire", "crime", "natural disaster"];

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isBellSwipe}
      onRequestClose={() => setIsBellSwipe(false)}
    >
      <TouchableWithoutFeedback onPress={() => setIsBellSwipe(false)}>
        <View className="h-screen w-full flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <View className="bg-white p-6 rounded-lg shadow-lg w-4/5">
            <Text className="text-xl font-bold text-center mb-4">Select Emergency Type</Text>

            {list.map((emergency) => (
              <TouchableOpacity
                key={emergency}
                onPress={() => setEmergencyType(emergency)}
                className="flex flex-row items-center space-x-4 py-3 px-4 border-b border-gray-200"
              >
                <View className="h-6 w-6 rounded-full border-2 border-blue-800 flex items-center justify-center">
                  {emergencyType === emergency && (
                    <View className="h-3 w-3 rounded-full bg-blue-800" />
                  )}
                </View>
                <Text className="text-lg">{emergency}</Text>
              </TouchableOpacity>
            ))}

            {/* Close Button */}
            <TouchableOpacity onPress={handleConfirmReport} className="mt-6 bg-blue-600 py-3 rounded-lg">
              <Text className="text-white text-center text-lg font-semibold">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ImmediateEmergency;
