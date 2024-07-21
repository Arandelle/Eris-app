import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Alert, ScrollView, SafeAreaView, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ref, update, onValue } from "firebase/database";
import { auth, database } from "./firebaseConfig"; 
import { onAuthStateChanged } from "firebase/auth";

const UpdateProfile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { onProfileUpdated } = route.params;
  const [userData, setUserData] = useState(null);
  const [mobileNum, setMobileNum] = useState("");
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [address, setCurrentAddress] = useState("");
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
          setMobileNum(data?.mobileNum || "");
          setFirstName(data?.firstname || "");
          setLastName(data?.lastname || "");
          setAge(data?.age || "");
          setCurrentAddress(data?.address || "");
          setLoading(false);
        } catch (error) {
          console.error("Error fetching user data:", error);
          Alert.alert("Error", "Failed to fetch user data. Please try again.");
        }
      } else {
        navigation.navigate("Login");
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleUpdateProfile = async () => {
    const user = auth.currentUser;
    const isProfileCompleted = firstname && lastname && age && address && mobileNum;
    if (user) {
      const updatedData = {
        firstname,
        lastname,
        age,
        address,
        email: user.email,
        mobileNum,
        profileComplete: isProfileCompleted,
      };

      const userRef = ref(database, `users/${user.uid}`);
      try {
        await update(userRef, updatedData);
        setUserData(updatedData);
        Alert.alert(
          "Success",
          "Profile updated successfully!",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
            },
            { 
              text: "OK", 
              onPress: () => {
                console.log("OK Pressed");
                onProfileUpdated(updatedData);  // Notify parent component about the update
                navigation.navigate("Profile");
              }
            }
          ],
          { cancelable: false }
        );
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UpdateProfile;
