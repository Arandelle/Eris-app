import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ref, serverTimestamp, push } from "firebase/database";
import { database } from "../services/firebaseConfig";
import { useNavigation } from "@react-navigation/native";

const Clearance = () => {
  const navigate = useNavigation();
  const [clearanceData, setClearanceData] = useState({
    type: "Clearance",
    firstname: "",
    lastname: "",
    age: "",
    address: "",
    gender: "Female",
    civilStatus: "Single",
    moveInYear: new Date().getFullYear(),
  });

  const years = [];
  for (let i = 1900; i <= new Date().getFullYear(); i++) {
    years.push(i);
  }

  const handleSubmitData = async () => {

    const {firstname, lastname, age, address} = clearanceData;

    if(!firstname || !lastname || !age || !address ){
      Alert.alert("Error", "Please complete the form");
      return;
    }

    const newClearanceData = {
      ...clearanceData,
      status: "pending",
      date: new Date().toISOString(),
      timestamp: serverTimestamp(), // Make sure timestamp is set at submission
    };

    const clearanceRef = ref(database, "requestClearance");

    try {
      await push(clearanceRef, newClearanceData);
      Alert.alert(
        "Success",
        "You can go to your barangay hall to get your barangay certificate!"
      );
    } catch (error) {
      Alert.alert("Error", `${error}`);
    }
    setClearanceData({});
    navigate.goBack();
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <View className="bg-white p-4 space-y-4">
          <Text className="text-gray-500 text-sm mb-4">
            Please ensure that all information you provide in this form is
            correct and complete to the best of your knowledge.
          </Text>

          <Text>Type of Certificate</Text>
          <View className="bg-gray-50 mb-2 border text-gray-900 rounded-lg w-full border-gray-300">
            <Picker
              selectedValue={clearanceData.type}
              onValueChange={(value) =>
                setClearanceData((prev) => ({
                  ...prev,
                  type: value,
                }))
              }
              style={{ height: 50 }}
            >
              <Picker.Item label="Clearance" value="Clearance" />
              <Picker.Item label="Indigency" value="Indigency" />
            </Picker>
          </View>

          <Text>First name</Text>
          <TextInput className="w-full border border-gray-300 rounded-lg p-4" 
            placeholder="Enter your firstname"
            value={clearanceData.firstname}
            onChangeText={(value) => setClearanceData((prev) => ({
              ...prev,
              firstname: value
            }))}
          />
          <Text>Last name</Text>
          <TextInput className="w-full border border-gray-300 rounded-lg p-4" 
            placeholder="Enter your lastname"
            value={clearanceData.lastname}
            onChangeText={(value) => setClearanceData((prev) => ({
              ...prev,
              lastname: value
            }))}
          />
          <Text>Age</Text>
          <TextInput className="w-full border border-gray-300 rounded-lg p-4" 
            placeholder="Enter your age"
            value={clearanceData.age}
            onChangeText={(value) => setClearanceData((prev) => ({
              ...prev,
              age: value
            }))}
          />
          <Text>Address</Text>
          <TextInput className="w-full border border-gray-300 rounded-lg p-4" 
            placeholder="Enter your complete address"
            value={clearanceData.address}
            onChangeText={(value) => setClearanceData((prev) => ({
              ...prev,
              address: value
            }))}
          />
          <Text>Gender</Text>
          <View className="bg-gray-50 mb-2 border text-gray-900 rounded-lg w-full border-gray-300">
            <Picker
              selectedValue={clearanceData.gender}
              onValueChange={(value) =>
                setClearanceData((prev) => ({
                  ...prev,
                  gender: value, // Update the type field
                }))
              }
              style={{ height: 50 }}
            >
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Male" value="Male" />
            </Picker>
          </View>
          <Text>Civil Status</Text>
          <View className="bg-gray-50 mb-2 border text-gray-900 rounded-lg w-full border-gray-300">
            <Picker
              selectedValue={clearanceData.civilStatus}
              onValueChange={(value) =>
                setClearanceData((prev) => ({
                  ...prev,
                  civilStatus: value, // Update the type field
                }))
              }
              style={{ height: 50 }}
            >
              <Picker.Item label="Single" value="Single" />
              <Picker.Item label="Married" value="Married" />
              <Picker.Item label="Widowed" value="Widowed" />
              <Picker.Item label="Divorced" value="Widowed" />
              <Picker.Item label="Separated" value="Separated" />
            </Picker>
          </View>

          <Text>Move-in Years</Text>
          <View className="bg-gray-50 mb-2 border text-gray-900 rounded-lg w-full border-gray-300">
            <Picker
              selectedValue={clearanceData.moveInYear}
              onValueChange={(value) =>
                setClearanceData((prev) => ({
                  ...prev,
                  moveInYear: value, // Update the type field
                }))
              }
              style={{ height: 50 }}
            >
            {years.map((year) => ( <Picker.Item key={year} label={`${year}`} value={year} /> ))}
            </Picker>
          </View>
          <TouchableOpacity
            className="p-3 w-full rounded-2xl bg-blue-500"
            onPress={handleSubmitData}
          >
            <Text className="text-white text-center text-lg font-bold">
              Request Barangay
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Clearance;
