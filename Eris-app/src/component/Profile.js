import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ref, update, onValue } from "firebase/database";
import { auth, database } from "./firebaseConfig"; // Adjust path as needed
import { signOut, onAuthStateChanged } from "firebase/auth";

const Profile = ({setIsProfileComplete}) => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [mobileNum, setMobileNum] = useState("");
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [address, setCurrentAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = ref(database, `users/${user.uid}`);

        try {
          const snapshot = await new Promise((resolve, reject) => {
            onValue(userRef, resolve, reject, { onlyOnce: true });
          });
          const data = snapshot.val();
          setUserData(data);
          setMobileNum(data?.mobileNum || "")
          setFirstName(data?.firstname || "");
          setLastName(data?.lastname || "");
          setAge(data?.age || "");
          setCurrentAddress(data?.address || "");
          setLoading(false); // Set loading to false after data is fetched
        } catch (error) {
          console.error("Error fetching user data:", error);
          Alert.alert("Error", "Failed to fetch user data. Please try again.");
        }
      } else {
        navigation.navigate("Login"); // Redirect to Login if not authenticated
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleShowUpdateForm = () => {
    setShowUpdateForm(!showUpdateForm);
  }
  const handleUpdateProfile = async () => {
    const user = auth.currentUser;
    const isProfileCompleted = firstname && age ? true : false
    if (user) {
      const updatedData = {
        firstname,
        lastname,
        age,
        address,
        email: user.email, // Maintain existing email
        mobileNum,
        profileComplete: isProfileCompleted
      };

      const userRef = ref(database, `users/${user.uid}`);
      try {
        await update(userRef, updatedData);
        setUserData(updatedData);
        updateProfileStatus(isProfileCompleted);
        Alert.alert("Success", "Profile updated successfully!");
      } catch (error) {
        console.error("Error updating user data:", error);
        Alert.alert("Error", error.message);
      }
    } else {
      Alert.alert("Error", "User not authenticated");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const updateProfileStatus = (status) => {
    setIsProfileComplete(status);
  };

  return (
    <View className="h-full bg-blue-600">

        <View className="bg-white space-y-1 h-full p-8 mt-20">
       <View className="space-y-2">
          <Text className="text-3xl text-center font-bold">{userData?.firstname} {userData?.lastname}</Text>
            <Text className="text-center font-bold text-lg">{userData?.mobileNum}</Text>
       </View>
        <Text className="text-lg text-gray-500 font-bold">Age: </Text> 
        <Text className="text-xl font-extrabold">{userData?.age}</Text> 
        <Text className="text-lg text-gray-500 font-bold">Email Address: </Text>
        <Text className="text-xl font-extrabold">{userData?.email}</Text>
        <Text className="text-lg text-gray-500 font-bold">Current Address: </Text>
        <Text className="text-xl font-extrabold">{userData?.address}</Text>
        <View><Button title="Update Profile" onPress={ handleShowUpdateForm} /></View>
        </View>

     {showUpdateForm && (<View> 
     <TextInput
        className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
        value={firstname}
        onChangeText={setFirstName}
        placeholder="Enter your firstname"
      />
      <TextInput
        className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
        value={lastname}
        onChangeText={setLastName}
        placeholder="Enter your lastname"
      />
      <TextInput
        className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
        value={mobileNum}
        onChangeText={setMobileNum}
        placeholder="Enter your mobile number"
      />
      <TextInput
        className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
        value={address}
        onChangeText={setCurrentAddress}
        placeholder="Enter your current address"
      />
      <TextInput
        className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
        value={age}
        onChangeText={setAge}
        placeholder="Enter your age"
      />
      <Button title="Update Profile" onPress={handleUpdateProfile} />
      </View>)}
    </View>
  );
};

export default Profile;
