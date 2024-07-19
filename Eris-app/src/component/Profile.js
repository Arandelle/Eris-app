import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ref, update, onValue } from "firebase/database";
import { auth, database } from "./firebaseConfig"; // Adjust path as needed
import { signOut, onAuthStateChanged } from "firebase/auth";

const Profile = ({ setIsProfileComplete }) => {
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
          setMobileNum(data?.mobileNum || "");
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
  };

  const handleUpdateProfile = async () => {
    const user = auth.currentUser;
    const isProfileCompleted =
      firstname && lastname && age && address && mobileNum ? true : false;
    if (user) {
      const updatedData = {
        firstname,
        lastname,
        age,
        address,
        email: user.email, // Maintain existing email
        mobileNum,
        profileComplete: isProfileCompleted,
      };

      const userRef = ref(database, `users/${user.uid}`);
      try {
        await update(userRef, updatedData);
        setUserData(updatedData);
        setIsProfileComplete(isProfileCompleted);
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
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ flex: 1, backgroundColor: "#e0f7fa" }}>
          <View style={{ backgroundColor: "#ffffff", margin: 16, borderRadius: 8, padding: 16 }}>
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>
                {userData?.firstname} {userData?.lastname}
              </Text>
              <Text style={{ fontSize: 18, textAlign: 'center', color: '#555' }}>
                {userData?.mobileNum}
              </Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Age:</Text>
            <Text style={{ fontSize: 20 }}>{userData?.age}</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Email Address:</Text>
            <Text style={{ fontSize: 20 }}>{userData?.email}</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Current Address:</Text>
            <Text style={{ fontSize: 20 }}>{userData?.address}</Text>
            <Button title="Update Profile" onPress={handleShowUpdateForm} />
          </View>

          {showUpdateForm && (
            <View style={{ margin: 16 }}>
              <TextInput
                style={{ backgroundColor: "#ffffff", borderColor: "#cccccc", borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10 }}
                value={firstname}
                onChangeText={setFirstName}
                placeholder="Enter your firstname"
              />
              <TextInput
                style={{ backgroundColor: "#ffffff", borderColor: "#cccccc", borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10 }}
                value={lastname}
                onChangeText={setLastName}
                placeholder="Enter your lastname"
              />
              <TextInput
                style={{ backgroundColor: "#ffffff", borderColor: "#cccccc", borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10 }}
                value={mobileNum}
                onChangeText={setMobileNum}
                placeholder="Enter your mobile number"
              />
              <TextInput
                style={{ backgroundColor: "#ffffff", borderColor: "#cccccc", borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10 }}
                value={address}
                onChangeText={setCurrentAddress}
                placeholder="Enter your current address"
              />
              <TextInput
                style={{ backgroundColor: "#ffffff", borderColor: "#cccccc", borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10 }}
                value={age}
                onChangeText={setAge}
                placeholder="Enter your age"
              />
              <Button title="Update Profile" onPress={handleUpdateProfile} />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
