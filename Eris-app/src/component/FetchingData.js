import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { ref, onValue } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from "./firebaseConfig";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FetchingData = () => {
  const [email, setEmail] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

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
        setModalVisible(!data.profileComplete); // Update modal visibility
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
          if (!parsedData.profileComplete) {
            setModalVisible(true);
          }
        }
        fetchUserData(user.uid);
      } else {
        // setAuth(false); // Uncomment or define setAuth if necessary
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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
    
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <View style={{ backgroundColor: 'white', width: 320, padding: 20, borderRadius: 10 }}>
          <Text style={{ fontSize: 18, marginBottom: 16 }}>
            To access certain features of the app, please update and verify your information.
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ color: 'gray', fontSize: 18 }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                navigation.navigate("Profile"); // Assuming you have a ProfileEdit screen
              }}
            >
              <Text style={{ color: 'blue', fontSize: 18 }}>Update Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FetchingData;
