import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import CustomInput from "../component/CustomInput";
import { ref, serverTimestamp, push } from "firebase/database";
import { database } from "../services/firebaseConfig";

const Clearance = () => {
  const [clearanceData, setClearanceData] = useState({
    firstname: "",
    lastname: "",
    age: "",
    address: "",
    gender: "",
    civilStatus: "",
    stay: "",
    timestamp: serverTimestamp(),
  });

  const handleSubmitData = async () => {
    const newClearanceData = {
      ...clearanceData,
      timestamp: serverTimestamp(), // Make sure timestamp is set at submission
    };

    const clearanceRef = ref(database, "requestClearance");

    try {
      await push(clearanceRef, newClearanceData);
      Alert.alert(
        "Success",
        "You can go to the nearest barangay hall to get your barangay clearance!"
      );
    } catch (error) {
      Alert.alert("Error", `${error}`);
    }
    setClearanceData({});
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <View className="bg-white p-4">
          <Text className="text-gray-500 text-sm mb-4">
            Please ensure that all information you provide in this form is
            correct and complete to the best of your knowledge.
          </Text>

          <CustomInput
            label="First Name"
            placeholder="Enter your first name"
            value={clearanceData.firstname}
            onChangeText={(text) =>
              setClearanceData((prev) => ({
                ...prev,
                firstname: text,
              }))
            }
          />
          <CustomInput
            label="Last Name"
            placeholder="Enter your last name"
            value={clearanceData.lastname}
            onChangeText={(text) =>
              setClearanceData((prev) => ({
                ...prev,
                lastname: text,
              }))
            }
          />
          <CustomInput
            label="Age"
            placeholder="Enter your age"
            value={clearanceData.age}
            onChangeText={(text) =>
              setClearanceData((prev) => ({
                ...prev,
                age: text,
              }))
            }
          />
          <CustomInput
            label="Address"
            placeholder="Enter your complete address"
            value={clearanceData.address}
            onChangeText={(text) =>
              setClearanceData((prev) => ({
                ...prev,
                address: text,
              }))
            }
          />
          <CustomInput
            label="Gender"
            placeholder="Enter your gender"
            value={clearanceData.gender}
            onChangeText={(text) =>
              setClearanceData((prev) => ({
                ...prev,
                gender: text,
              }))
            }
          />
          <CustomInput
            label="Civil Status"
            placeholder="Enter your status"
            value={clearanceData.civilStatus}
            onChangeText={(text) =>
              setClearanceData((prev) => ({
                ...prev,
                civilStatus: text,
              }))
            }
          />
          <CustomInput
            label="Yrs stay in Bagtas"
            placeholder="Enter your years of stay in Bagtas"
            value={clearanceData.stay}
            onChangeText={(text) =>
              setClearanceData((prev) => ({
                ...prev,
                stay: text,
              }))
            }
          />
          <TouchableOpacity
            className="p-3 w-full rounded-2xl bg-blue-500"
            onPress={handleSubmitData}
          >
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
