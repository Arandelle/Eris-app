import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import CustomInput from "../component/CustomInput";

const Clearance = () => {
  return (
    <SafeAreaView>
      <ScrollView>
        <View className="bg-white p-4">
          <Text className="text-gray-500 text-sm mb-4">
            Please ensure that all information you provide in this form is
            correct and complete to the best of your knowledge.
          </Text>

          <CustomInput label="First Name" placeholder="Enter your firstname" />
          <CustomInput label="Last Name" placeholder="Enter your lastname" />
          <CustomInput label="Age" placeholder="Enter your age" />
          <CustomInput
            label="Address"
            placeholder="Enter your complete address"
          />
          <CustomInput label="Gender" placeholder="Enter your gender" />
          <CustomInput label="Civil Status" placeholder="Enter your status" />
          <CustomInput
            label="Yrs stay in Bagtas"
            placeholder="Enter your years of stay in Bagtas"
          />
          <TouchableOpacity className="p-3 w-full rounded-2xl bg-blue-500">
            <Text className="text-white text-center text-lg font-bold">
              Request Barangay Clearance
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Clearance;
