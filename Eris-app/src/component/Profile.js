import React, { useState, useEffect } from "react";
import { View, Text, Button, ActivityIndicator, ScrollView, SafeAreaView, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ref, onValue } from "firebase/database";
import { auth, database } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const Profile = ({setIsProfileComplete}) => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid) => {
    setLoading(true);
    const userRef = ref(database, `users/${uid}`);
    try {
      const snapshot = await new Promise((resolve, reject) => {
        onValue(userRef, resolve, reject, { onlyOnce: true });
      });
      const data = snapshot.val();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to fetch user data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        navigation.navigate("Login");
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleShowUpdateForm = () => {
    navigation.navigate("UpdateProfile", {
      onProfileUpdated: (updatedData) => {
        setUserData(updatedData);
      },
    });
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
