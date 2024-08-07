import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Button,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { auth, database } from "../services/firebaseConfig";
import { ref, serverTimestamp, push, onValue, set, get, update} from "firebase/database";
import { useFetchData } from "../hooks/useFetchData";
import * as Location from "expo-location";

const Request = () => {
  const [emergencyType, setEmergencyType] = useState(""); 
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const { userData } = useFetchData();
  const [hasActiveRequest, setHasActiveRequest] = useState(false);
  const [newRequestKey, setNewRequestKey] = useState(null);
  const [emergencyExpired, setEmergencyExpired] = useState(false);
  const [emergencyAccepted, setEmergencyAccepted] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location denied");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      const locString = `${loc.coords.latitude}, ${loc.coords.longitude}`;
      setLocation(locString);
    })();
  }, []);

  useEffect(()=>{
    checkActiveRequest();
  }, [userData])

  const checkActiveRequest = async () =>{
    const user = auth.currentUser;

    if (user) {
      const userRef = ref(database, `users/${user.uid}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();

      if (userData && userData.activeEmergency){
        const emergencyRef = ref(database, `emergencyRequests/${userData.activeEmergency.emergencyId}`);
        const emergencySnapshot = await get(emergencyRef);
        const emergencyData = emergencySnapshot.val();
        
        if(emergencyData){
          const now = new Date().getTime();
          const expiresAt = new Date(emergencyData.expiresAt).getTime();

          if(now > expiresAt && emergencyData.status === "pending"){
            await update(emergencyRef, {status: "expired"});
            setEmergencyExpired(true);
            setHasActiveRequest(false);
            Alert.alert("Request Expired", "Your last emergency request was expired")
          } else if(emergencyData.status === "pending"){
            setHasActiveRequest(true);
          } else if (emergencyData.status === "accepted"){
            setEmergencyAccepted(true);
          }else{
            setHasActiveRequest(false);
          }
        }
      }else{
        setHasActiveRequest(false);
      }
    }
  }

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
      Alert.alert("Active Request", "You have already submitted a request. Please wait until it's resolved.");
      return;
    }
    try {
      const [latitude, longitude] = location.split(", ").map(coord => parseFloat(coord));
      const newRequest = {
        userId: user.uid,
        timestamp: serverTimestamp(),
        location: { 
          latitude: Number(latitude), 
          longitude: Number(longitude) 
        },
        type: emergencyType,
        description,
        status: "pending",
        expiresAt: new Date(Date.now() + 30000).toISOString(), //Add expiration time
        name: `${userData.firstname} ${userData.lastname}`,
      };

      const emergencyRequestRef = ref(database, "emergencyRequests");
      const newRequestRef = await push(emergencyRequestRef, newRequest);
      setNewRequestKey(newRequestRef.key);
      const userRef = ref(database, `users/${user.uid}`);
      
      await set(userRef, {
        ...userData,
        activeEmergency: {
          emergencyId: newRequestRef.key,
          location: {
            latitude: Number(latitude),
            longitude: Number(longitude)
          }
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
      Alert.alert("Error", "Could not submit emergency request, please try again");
    }
  };

  useEffect(()=>{
    const checkExpiration = setInterval(checkActiveRequest, 5000);
    return ()=> clearInterval(checkExpiration);
  }, [])
  
  return (
    <ScrollView className="flex-1 p-5 bg-gray-100">
      <Text className="font-bold text-xl text-center text-red-600 mb-5">
        Emergency Request
      </Text>
      <>
        {hasActiveRequest ? (
          <Text className="text-lg text-center text-green-600 mb-5">
            You have an active emergency request. Please wait for it to be resolved.
          </Text>
        ) :  emergencyExpired ? (
            <Text className="text-lg text-center text-red-600 italic mb-5">
              Your last emergency request expired. You can submit a new one if needed.
            </Text>
        ) : emergencyAccepted && (
          <Text className="text-lg text-center text-blue-500 italic mb-5">
              Your last emergency request accepted. You can submit a new one if needed.
            </Text>
        )
        }
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
                <Picker.Item label="Medical" value="medical" />
                <Picker.Item label="Fire" value="fire" />
                <Picker.Item label="Police" value="police" />
                <Picker.Item label="Natural Disaster" value="disaster" />
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
              className="border p-2.5 rounded-md border-gray-300 bg-white text-sm"
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
            <Text className="text-white text-lg font-bold">
              Submit Emergency Request
            </Text>
          </TouchableOpacity>
        </View>
      </>
    </ScrollView>
  );
};

export default Request;
