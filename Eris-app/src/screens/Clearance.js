import React, { useState } from "react";
import { View, Text, SafeAreaView, ScrollView, Alert } from "react-native";
import { ref, serverTimestamp, push, set } from "firebase/database";
import { database } from "../services/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import CustomButton from "../component/CustomButton";
import TextInputStyle from "../component/TextInputStyle";
import PickerField from "../component/PickerField"; // Ensure this path is correct

const Clearance = () => {
  const navigate = useNavigation();
  const [isComplete, setIsComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [clearanceData, setClearanceData] = useState({
    docsType: "Clearance",
    fullname: "",
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

  useEffect(() => {
    const {
      docsType,
      fullname,
      age,
      address,
      gender,
      civilStatus,
      moveInYear,
    } = clearanceData;
    const completeData =
      docsType &&
      fullname &&
      age &&
      address &&
      gender &&
      civilStatus &&
      moveInYear;
    setIsComplete(completeData);
    setErrorMessage("Please complete all fields");
  }, [
    clearanceData.docsType,
    clearanceData.fullname,
    clearanceData.address,
    clearanceData.gender,
    clearanceData.civilStatus,
    clearanceData.moveInYear,
  ]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView style={{ flex: 1 }}>
        <View className="bg-white p-4 space-y-4">
          <Text className="text-gray-500 text-sm">
            Please ensure that all information you provide in this form is
            correct and complete to the best of your knowledge.
          </Text>
          <View>
            <PickerField
              label="Type of Certificate"
              selectedValue={clearanceData.docsType}
              onValueChange={(value) =>
                setClearanceData((prev) => ({
                  ...prev,
                  docsType: value,
                }))
              }
              items={[
                { label: "Clearance", value: "Clearance" },
                { label: "Indigency", value: "Indigency" },
              ]}
            />
          </View>
          <View>
            <TextInputStyle
              label={"Full Name"}
              placeholder="Enter your full name"
              value={clearanceData.fullname}
              onChangeText={(value) =>
                setClearanceData((prev) => ({
                  ...prev,
                  fullname: value,
                }))
              }
            />
          </View>
          <View>
            <TextInputStyle
              label={"Age"}
              placeholder="Enter your age"
              value={clearanceData.age}
              onChangeText={(value) =>
                setClearanceData((prev) => ({
                  ...prev,
                  age: value,
                }))
              }
            />
          </View>
          <View>
            <TextInputStyle
              label={"Address"}
              placeholder="Enter your address"
              value={clearanceData.address}
              onChangeText={(value) =>
                setClearanceData((prev) => ({
                  ...prev,
                  address: value,
                }))
              }
            />
          </View>
          <View>
            <PickerField
              label="Gender"
              selectedValue={clearanceData.gender}
              onValueChange={(value) =>
                setClearanceData((prev) => ({
                  ...prev,
                  gender: value,
                }))
              }
              items={[
                { label: "Female", value: "Female" },
                { label: "Male", value: "Male" },
              ]}
            />
          </View>
          <View>
            <PickerField
              label="Civil Status"
              selectedValue={clearanceData.civilStatus}
              onValueChange={(value) =>
                setClearanceData((prev) => ({
                  ...prev,
                  civilStatus: value,
                }))
              }
              items={[
                { label: "Single", value: "Single" },
                { label: "Married", value: "Married" },
                { label: "Divorced", value: "Divorced" },
                { label: "Widowed", value: "Widowed" },
              ]}
            />
          </View>
          <View>
            <PickerField 
              label="Move-in Year"
              selectedValue={clearanceData.moveInYear}
              onValueChange={(value) =>
                setClearanceData((prev) => ({
                  ...prev,
                  moveInYear: value,
                }))
              }
              items={years.map((year) => ({
                label: `${year}`,
                value: year,
              }))}
            />
          </View>
        </View>
      </ScrollView>
      <CustomButton
        isValid={isComplete}
        label={ isComplete ? `Request ${clearanceData.docsType}` : errorMessage }
        onPress={handleSubmitData}
      />
    </SafeAreaView>
  );
};

export default Clearance;
