import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  Alert,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ref, update, onValue } from "firebase/database";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, database } from "./firebaseConfig";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Home = ({ setAuth, badgeSize, setBadgeSize }) => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid) => {
    setLoading(true);
    const userRef = ref(database, `users/${uid}`);
    try {
      const snapshot = await new Promise((resolve, reject) => {
        onValue(userRef, resolve, reject, { onlyOnce: true });
      });
      const data = snapshot.val();
      if (data) {
        setEmail(data.email || "");
        // Check if name and age are empty before setting modal visibility
        setModalVisible(!data.name || !data.age);
        await AsyncStorage.setItem("userData", JSON.stringify(data));
      }
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
        const cachedData = await AsyncStorage.getItem("userData");
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          setEmail(parsedData.email || "");
          setModalVisible(!parsedData.name || !parsedData.age);
        }
        fetchUserData(user.uid);
      } else {
        setAuth(false);
        navigation.navigate("Login");
      }
    });

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        const user = auth.currentUser;
        if (user) {
          fetchUserData(user.uid);
        }
      }
    });

    return () => {
      unsubscribeAuth();
      subscription.remove();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAuth(false);
      navigation.navigate("Login");
    } catch (e) {
      console.error(e);
    }
  };

  const handleBadgeSize = () => {
    setBadgeSize(badgeSize + 1);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="h-full flex items-center justify-center bg-gray-100">
      <View className="flex flex-row w-72 justify-between">
        <Button title="Logout" onPress={handleLogout} />
        <Button title="Add Notification" onPress={handleBadgeSize} />
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          className="flex-1 justify-center items-center bg-opacity-50"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View className="bg-white w-80 p-5 rounded-lg">
            <Text className="text-lg mb-4">
              To access certain features of the app, please update and verify
              your information.
            </Text>
            <View className="flex-row justify-around">
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text className="text-gray-600 text-lg">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate("Profile"); // Assuming you have a ProfileEdit screen
                }}
              >
                <Text className="text-blue-600 text-lg">Update Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Home;
