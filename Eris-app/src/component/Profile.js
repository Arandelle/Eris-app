import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Alert,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ref, onValue } from "firebase/database";
import { auth, database } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const Profile = ({ setIsProfileComplete }) => {
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
        const isProfileCompleted =
          updatedData.firstname &&
          updatedData.lastname &&
          updatedData.age &&
          updatedData.gender &&
          updatedData.address &&
          updatedData.mobileNum;
        setIsProfileComplete(isProfileCompleted);
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1">
        <ActivityIndicator size="large" color="#007bff" />
      </SafeAreaView>
    );
  }

  const renderPlaceholder = (value, placeholder) => {
    return value ? (
      <Text className="text-xl text-gray-500">{value}</Text>
    ) : (
      <Text className="italic text-xl text-gray-900">{placeholder}</Text>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <ScrollView className="pb-5">
        <View className="flex-1 bg-white rounded-lg m-4 p-5 shadow-md ">
          <View className="items-center pb-5">
            <Text className="text-2xl font-bold pb-2">
              {userData?.firstname && userData?.lastname
                ? `${userData.firstname} ${userData.lastname}`
                : renderPlaceholder(null, "Your Name")}
            </Text>
            <Text className="text-lg text-white bg-sky-300 p-1 rounded-lg">
              {userData?.mobileNum
                ? userData.mobileNum
                : renderPlaceholder(null, "Phone number")}
            </Text>
          </View>
          <View className="mb-5 space-y-8">
            <View>
              <Text className="text-xl font-bold mb-2 ">
                Age:{" "}
                <Text className="text-lg text-gray-500 font-bold">
                  {userData?.age
                    ? userData?.age
                    : renderPlaceholder(null, "Age")}
                </Text>
              </Text>
            </View>
            <View>
              <Text className="text-xl font-bold mb-2 ">
                Gender:{" "}
                <Text className="text-lg text-gray-500 font-bold">
                  {userData?.gender
                    ? userData?.gender
                    : renderPlaceholder(null, "Your gender")}
                </Text>
              </Text>
            </View>
            <View>
              <Text className="text-xl font-bold mb-2 ">Email Address:</Text>
              <Text className="text-lg text-gray-500 font-bold">
                {userData?.email}
              </Text>
            </View>
            <View>
              <Text className="text-xl font-bold mb-2 ">Current Address:</Text>
              <Text className="text-lg text-gray-500 font-bold">
                {userData?.address
                  ? userData.address
                  : renderPlaceholder(null, "House No. Street Barangay")}
              </Text>
            </View>
          </View>
          <Button
            title="Update Profile"
            onPress={handleShowUpdateForm}
            color="#007bff"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
