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
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(true);

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
          setName(data?.name || "");
          setAge(data?.age || "");
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

  const handleUpdateProfile = async () => {
    const user = auth.currentUser;
    const isProfileCompleted = name && age ? true : false
    if (user) {
      const updatedData = {
        name,
        age,
        email: user.email, // Maintain existing email
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
    <View className="h-full bg-gray-100">
      <Text className="text-lg mb-2">Profile Information</Text>
      <Text>Email: {userData?.email}</Text>
      <Text>First Name: {userData?.firstname}</Text>
      <Text>Last Name: {userData?.lastname}</Text>
      <Text>Age: {userData?.age}</Text>
      <Text>Gender: {userData?.gender}</Text>
      <Text>Address: {userData?.address}</Text>


      <TextInput
        className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
      />
      <TextInput
        className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
        value={age}
        onChangeText={setAge}
        placeholder="Enter your age"
      />
      <Button title="Update Profile" onPress={handleUpdateProfile} />
    </View>
  );
};

export default Profile;
