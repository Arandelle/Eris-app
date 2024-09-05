import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { auth, database } from "../services/firebaseConfig";
import { ref, serverTimestamp, push, update, get } from "firebase/database";
import { useFetchData } from "../hooks/useFetchData";
import History from "./History";
import useLocationTracking from "../hooks/useLocationTracking";
import useActiveRequest from "../hooks/useActiveRequest";
import useFetchHistory from "../hooks/useFetchHistory";
import useResponderData from "../hooks/useResponderData"

const Request = ({ showHistory, setShowHistory }) => {
  const [emergencyType, setEmergencyType] = useState("");
  const [description, setDescription] = useState("");
  const [newRequestKey, setNewRequestKey] = useState(null);

  const { userData } = useFetchData("users");
  const { responderData} = useResponderData();
  const { location, setLocation, latitude, longitude } = useLocationTracking();
  const {
    checkActiveRequest,
    emergencyExpired,
    setEmergencyExpired,
    emergencyAccepted,
    setEmergencyAccepted,
    hasActiveRequest,
    setHasActiveRequest,
  } = useActiveRequest(userData);
  
  const { emergencyHistory } = useFetchHistory(showHistory);

  const handleSubmit = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "No user is signed in.");
      return;
    }
    if (!emergencyType || !description || !location) {
      Alert.alert("Error", "Please fill in all the fields");
      return;
    }
    if (hasActiveRequest) {
      Alert.alert(
        "Active Request",
        "You have already submitted a request. Please wait until it's resolved."
      );
      return;
    }
    try {
      const newRequest = {
        userId: user.uid,
        date: new Date().toISOString(),
        timestamp: serverTimestamp(),
        locationCoords: {
          latitude: latitude,
          longitude: longitude,
        },
        location: location,
        type: emergencyType,
        description,
        status: "pending",
        expiresAt: new Date(Date.now() + 30000).toISOString(), // Add expiration time
        name: `${userData.firstname} ${userData.lastname}`,
      };

      const emergencyRequestRef = ref(database, "emergencyRequest");
      const userHistoryRef = ref(database, `users/${user.uid}/emergencyHistory`);
      await push(userHistoryRef, newRequest);
      
      const newRequestRef = await push(emergencyRequestRef, newRequest);
      setNewRequestKey(newRequestRef.key);
      const userRef = ref(database, `users/${user.uid}`);

      await update(userRef, {
        activeRequest: {
          requestId: newRequestRef.key,
          locationCoords: {
            latitude: latitude,
            longitude: longitude,
          },
          location: location,
        },
      });

      const adminId = "7KRIOXYy6QTW6QmnWfh9xqCNL6T2";
      const notificationRef = ref(database, `admins/${adminId}/notifications`);
      const newNotification = {
        type: "request",
        message: `User submit an emergency request:`,
        description: `${description}`,
        location: `${location}`,
        email: `${user.email}`,
        isSeen: false,
        date: new Date().toISOString(),
        timestamp: serverTimestamp(), // Add this line
        img: "https://flowbite.com/docs/images/people/profile-picture-1.jpg",
      };

      await push(notificationRef, newNotification);

      const notificationUserRef = ref(
        database,
        `users/${user.uid}/notifications`
      );
      const newUserNotification = {
        type: "emergency",
        title: "Success!",
        message: `You have successfully submitted an emergency assistance`,
        email: `${user.email}`,
        isSeen: false,
        date: new Date().toISOString(),
        timestamp: serverTimestamp(), // Add this line
        img: userData.img,
        icon: "hospital-box",
      };

      await push(notificationUserRef, newUserNotification);

      responderData.forEach(async (responder) =>{
        if(responder.profileComplete){
          const notificationResponderRef = ref(database, `responders/${responder.id}/notifications`);
          const newResponderNotification = {
            type: "request",
            message: `User submit an emergency request:`,
            description: `${description}`,
            location: `${location}`,
            email: `${user.email}`,
            isSeen: false,
            date: new Date().toISOString(),
            timestamp: serverTimestamp(),
            img: "https://flowbite.com/docs/images/people/profile-picture-1.jpg",
          };
            await push(notificationResponderRef, newResponderNotification);
        }
      });

      Alert.alert("Emergency Request Submitted", "Help is on the way!");
      setEmergencyType("");
      setDescription("");
      setLocation("");

      setHasActiveRequest(true);
      setEmergencyExpired(false);
      setEmergencyAccepted(false);
    } catch (error) {
      console.error("Error submitting emergency request", error);
      Alert.alert(
        "Error",
        "Could not submit emergency request, please try again"
      );
    }
  };

  useEffect(() => {
    const checkExpiration = setInterval(checkActiveRequest, 5000);
    return () => clearInterval(checkExpiration);
  }, []);

  return (
    <ScrollView className="flex-1 p-5 bg-gray-100">
      <Text className="font-bold text-xl text-center text-red-600 mb-5">
        Emergency Request
      </Text>
      <>
        {hasActiveRequest ? (
          <Text className="text-lg text-center text-green-600 mb-5">
            You have an active emergency request. Please wait for it to be
            resolved.
          </Text>
        ) : emergencyExpired ? (
          <Text className="text-lg text-center text-red-600 italic mb-5">
            Your last emergency request expired. You can submit a new one if
            needed.
          </Text>
        ) : (
          emergencyAccepted && (
            <Text className="text-lg text-center text-blue-500 italic mb-5">
              Your last emergency request was accepted. You can submit a new one
              if needed.
            </Text>
          )
        )}
        <View className="space-y-5">
          <View>
            <Text className="text-lg mb-1 text-gray-600">Emergency Type:</Text>            
            <View className="border border-gray-300 rounded-md bg-white">
              <Picker
                selectedValue={emergencyType}
                onValueChange={(itemValue) => setEmergencyType(itemValue)}
                className="h-22"
              >
                <Picker.Item label="Select type" value="" />
                <Picker.Item label="Medical Emergency" value="medical" />
                <Picker.Item label="Crime" value="crime" />
                <Picker.Item label="Noise Complaint" value="noise" />
                <Picker.Item label="Public Safety Issue" value="disaster" />
              </Picker>
            </View>
          </View>

          <View>
            <Text className="text-lg mb-1 text-gray-600">Description:</Text>
            <TextInput
              className="border p-2.5 rounded-md border-gray-300 bg-white text-sm"
              multiline
              numberOfLines={4}
              onChangeText={setDescription}
              value={description}
              placeholder="Briefly describe the emergency"
            />
          </View>

          <View>
            <Text className="text-lg mb-1 text-gray-600">Location:</Text>
            <TextInput
              className="border p-2.5 rounded-md border-gray-300 bg-gray-300 text-lg text-gray-900"
              onChangeText={setLocation}
              value={location}
              placeholder="Your current location"
              editable={false} // Make the field read-only
            />
          </View>
          <TouchableOpacity
            className="bg-red-600 p-3.5 rounded-md items-center"
            onPress={handleSubmit}
          >
            <Text className="text-white text-lg font-bold">Submit Request</Text>
          </TouchableOpacity>
        </View>
      </>
      <History
        showHistory={showHistory}
        setShowHistory={setShowHistory}
        emergencyHistory={emergencyHistory}
      />
    </ScrollView>
  );
};

export default Request;
