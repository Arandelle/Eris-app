import React, { useState } from "react";
import { View, Text, SafeAreaView, ScrollView, Alert } from "react-native";
import { ref, serverTimestamp, push, set, get } from "firebase/database";
import { auth, database } from "../services/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import CustomButton from "../component/CustomButton";
import TextInputStyle from "../component/TextInputStyle";
import PickerField from "../component/PickerField"; // Ensure this path is correct
import useCurrentUser from "../hooks/useCurrentUser";
import useFetchDocuments from "../hooks/useFetchDocuments";

const Clearance = () => {
  const { currentUser } = useCurrentUser();
  const user = auth.currentUser;
  const navigate = useNavigation();
  const [isComplete, setIsComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPendingOrReady, setIsPendingOrReady] = useState({
    pending: false,
    ready: false,
  });
  const { documents, loading, error } = useFetchDocuments();
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
      customUserId: currentUser?.customId,
      userId: user.uid,
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
    const { docsType, fullname, age, address, gender, civilStatus, moveInYear } = clearanceData;
    const completeData = docsType && fullname && age && address && gender && civilStatus && moveInYear;
    
    if(isPendingOrReady.pending){
      setIsComplete(false);
      setErrorMessage("Last request is pending");
    } else{
    setIsComplete(completeData);
    setErrorMessage("Please complete all fields");
    }

  }, [
    clearanceData.docsType,
    clearanceData.fullname,
    clearanceData.age,
    clearanceData.address,
    clearanceData.gender,
    clearanceData.civilStatus,
    clearanceData.moveInYear,
    isPendingOrReady
  ]);

  // Check if there is a pending or ready request for the user
  // fill the form with the user's data
  useEffect(() => {
    if (currentUser) {
      setClearanceData((prev) => ({
        ...prev,
        fullname: currentUser.fullname || "",
        age: currentUser.age || "",
        address: currentUser.address || "",
      }));

      const checkPendingRequest = () => {
        if (documents.length > 0) {
          const pendingRequest = documents.find(
            (doc) => doc.status === "pending"
          );
          const readyRequest = documents.find(
            (doc) => doc.status === "ready for pickup"
          );
          setIsPendingOrReady({
            pending: pendingRequest,
            ready: readyRequest,
          });
        }
      };
      checkPendingRequest();
    }
  }, [currentUser, documents]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView style={{ flex: 1 }}>
        <View className="bg-white p-4 space-y-4">
          <Text className="text-gray-500 text-sm">
            Please ensure that all information you provide in this form is
            correct and complete to the best of your knowledge.
            {currentUser?.fullname}
          </Text>
          {isPendingOrReady.pending && (
            <Text className="text-red-500">
              You have a pending request. Please wait.
            </Text>
          )}
          {isPendingOrReady.ready && (
            <Text className="text-green-500">
              Your last request is ready for pick-up.
            </Text>
          )}

          <View>
            <PickerField
              label="Type of Certificate"
              selectedValue={clearanceData.docsType}
              onValueChange={(value) =>
                setClearanceData((prev) => ({ ...prev, docsType: value }))
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
                setClearanceData((prev) => ({ ...prev, fullname: value }))
              }
            />
          </View>
          <View>
            <TextInputStyle
              label={"Age"}
              placeholder="Enter your age"
              value={clearanceData.age}
              onChangeText={(value) =>
                setClearanceData((prev) => ({ ...prev, age: value }))
              }
            />
          </View>
          <View>
            <TextInputStyle
              label={"Address"}
              placeholder="Enter your address"
              value={clearanceData.address}
              onChangeText={(value) =>
                setClearanceData((prev) => ({ ...prev, address: value }))
              }
            />
          </View>
          <View>
            <PickerField
              label="Gender"
              selectedValue={clearanceData.gender}
              onValueChange={(value) =>
                setClearanceData((prev) => ({ ...prev, gender: value }))
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
                setClearanceData((prev) => ({ ...prev, civilStatus: value }))
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
                setClearanceData((prev) => ({ ...prev, moveInYear: value }))
              }
              items={years.map((year) => ({ label: `${year}`, value: year }))}
            />
          </View>
        </View>
      </ScrollView>
      <CustomButton
        isValid={isComplete && !isPendingOrReady.pending}
        label={
          isComplete && !isPendingOrReady.pending
            ? `Request ${clearanceData.docsType}`
            : errorMessage
        }
        onPress={handleSubmitData}
        disabled={isPendingOrReady}
      />
    </SafeAreaView>
  );
};

export default Clearance;
