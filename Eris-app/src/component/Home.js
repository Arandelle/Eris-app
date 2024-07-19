import React, { useState, useEffect } from "react";
import { View,Button,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";
import FetchingData from "./FetchingData";

const Home = ({ setAuth, badgeSize, setBadgeSize, setIsProfileComplete }) => {
  const navigation = useNavigation();
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


  return (
    <View>
      <FetchingData setIsProfileComplete={setIsProfileComplete}/>
      <View className="h-full flex items-center justify-center bg-gray-100">
        <View className="flex flex-row w-72 justify-between">
          <Button title="Logout" onPress={handleLogout} />
          <Button title="Add Notification" onPress={handleBadgeSize} />
        </View>
      </View>
    </View>
  );
};

export default Home;
