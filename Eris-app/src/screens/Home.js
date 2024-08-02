import React, { useState, useEffect } from "react";
import { View,Button} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import FetchingData from "../services/FetchingData";

const Home = ({  badgeSize, setBadgeSize, setIsProfileComplete }) => {
  const navigation = useNavigation();
  const handleLogout = async () => {
    try {
      await signOut(auth);
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
        <View className="flex flex-row w-full justify-around">
          <Button title="Logout" onPress={handleLogout} />
          <Button title="Add Notification" onPress={handleBadgeSize} />
        </View>
      </View>
    </View>
  );
};

export default Home;
