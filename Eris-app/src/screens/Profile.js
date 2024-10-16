import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { ref, onValue } from "firebase/database";
import { auth, database } from "../services/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const Profile = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logout, setLogout] = useState(false);

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

  useFocusEffect(
    useCallback(() => {
      const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        if (user) {
          fetchUserData(user.uid);
        } else {
          navigation.navigate("Login");
        }
      });

      return () => unsubscribeAuth();
    }, [navigation])
  );

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
    navigation.navigate("UpdateProfile");
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

  const handleLogoutModal = () => {
    setLogout(!logout);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate("Login");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <ScrollView>
        <View className="flex-1 justify-between bg-white rounded-lg m-4 p-5 shadow-md">
          <View className="items-center border-b-2 border-b-gray-300">
            <View className="relative">
              {userData?.img ? (
                <Image
                  source={{ uri: userData.img }}
                  className="h-[100px] w-[100px] rounded-full"
                />
              ) : (
                <Text className="text-gray-900 text-lg">
                  Image not available
                </Text>
              )}
              <TouchableOpacity
                className="absolute bottom-0 right-0 rounded-full p-2 bg-white"
                onPress={handleShowUpdateForm}
              >
                <Icon name="pencil" size={20} color={"blue"} />
              </TouchableOpacity>
            </View>
            <Text className="text-2xl font-bold p-2">
              {userData?.firstname && userData?.lastname
                ? `${userData.firstname} ${userData.lastname}`
                : renderPlaceholder(null, "Your Name")}
            </Text>
          </View>
          <View className="mb-5 space-y-8 py-2">
            <Text className="italic font-bold bg-blue-100 text-blue-600 p-2 text-lg rounded-md">
              {userData.customId}
            </Text>
            <View>
              <Text className="text-xl font-bold mb-2 ">Contact:</Text>
              <View className="flex flex-col justify-between space-y-1">
                <Text className="text-lg text-gray-500 font-bold">
                  {userData?.email}
                </Text>
                <Text className="text-lg text-gray-500 font-bold">
                  {userData.mobileNum ? userData.mobileNum : "not yet set"}
                </Text>
              </View>
            </View>
            <View>
              <Text className="text-xl font-bold mb-2">
                Age:{" "}
                <Text className="text-lg text-gray-500 font-bold">
                  {userData?.age
                    ? userData.age
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
              <Text className="text-xl font-bold mb-2 ">Current Address:</Text>
              <Text className="text-lg text-gray-500 font-bold">
                {userData?.address
                  ? userData.address
                  : renderPlaceholder(null, "House No. Street Barangay")}
              </Text>
            </View>
                        
          {!userData.profileComplete && (
            <View className="p-4 bg-red-100 rounded-md">
            <Text className="text-gray-900">Please update your profile for security purposes</Text>
            </View>
          )}

          </View>
          <View className="mb-2 space-y-2.5">
            <TouchableOpacity
              className="p-3 bg-blue-500 rounded-full"
              onPress={handleLogoutModal}
            >
              <Text className="text-center text-xl text-white font-bold">
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={logout}
        onRequestClose={() => setLogout(false)}
      >
        <TouchableWithoutFeedback onPress={() => setLogout(false)}>
          <View
            className="flex w-full h-full py-14 items-center justify-center"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <View className="h-56 justify-center bg-white w-full absolute bottom-0 rounded-t-xl">
              <View className="space-y-3">
                <Text className="text-gray-900 font-extrabold text-2xl text-center">
                  Are you sure you want to logout?
                </Text>
                <View className="space-y-3 py-3 px-5">
                  <TouchableOpacity
                    className="p-3 w-full bg-blue-600 rounded-2xl"
                    onPress={handleLogout}
                  >
                    <Text className="text-white text-lg text-center font-extrabold">
                      Confirm
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="p-3 w-full border-2 border-blue-500 rounded-2xl"
                    onPress={handleLogoutModal}
                  >
                    <Text className="text-center text-lg font-extrabold text-blue-500">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;