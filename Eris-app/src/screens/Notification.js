import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { auth, database } from "../services/firebaseConfig";
import { onValue, ref } from "firebase/database";
import { useFetchData } from "../hooks/useFetchData";
import { getTimeDifference } from "../helper/getTimeDifference";
import { formatDate } from "../helper/FormatDate";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

const Notification = () => {
  const navigation = useNavigation();
  const { userData } = useFetchData();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;

    if (user) {
      const userNotificationRef = ref(
        database,
        `users/${user.uid}/notifications`
      );

      // Listen for changes in the notifications data
      onValue(userNotificationRef, (snapshot) => {
        const data = snapshot.val();

        // Convert the data object to an array of notifications
        if (data) {
          const notificationList = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));

          // update the state with the fetched notificaitons
          setNotifications(notificationList);
        } else {
          // handle the case where there are no notifications
          setNotifications([]);
        }
      });
    }
  }, []);

  return (
    <ScrollView>
      <View className="h-full w-full">
        <TouchableOpacity
          onPress={() => {
            if (userData.profileComplete) {
              navigation.navigate("Profile");
            } else {
              navigation.navigate("UpdateProfile");
            }
          }}
        >
          {notifications.map((notifications) => (
            <View
              key={notifications.id}
              className="flex flex-row justify-between p-4 bg-gray-50"
            >
              <View className="relative">
                <Image
                  source={{ uri: !userData.profileComplete ? notifications.img : userData.img}}
                  className="rounded-full h-14 w-14 border-4 border-blue-500"
                />
                <View className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 border-2 border-white">
                  <Icon
                    name={!userData.profileComplete ? notifications.icon : "account-check"}
                    size={16}
                    color={"white"}
                  />
                </View>
              </View>
              <View className="pl-4 flex-1">
                <View className="text-sm mb-1 text-gray-600 dark:text-gray-300">
                  <Text className="font-semibold text-lg text-gray-800">
                    Welcome {userData?.firstname}!
                  </Text>
                  <Text>{notifications.message.toUpperCase()}</Text>
                </View>
                <View className="flex flex-row justify-between text-xs text-gray-500 dark:text-gray-400">
                  <Text>{getTimeDifference(notifications.timestamp)}</Text>
                  <Text className="text-blue-500 dark:text-green-400">
                    {formatDate(notifications.date)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Notification;
