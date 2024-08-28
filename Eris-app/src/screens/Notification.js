import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView } from "react-native";
import { auth, database } from "../services/firebaseConfig";
import { onValue, ref } from "firebase/database";
import { useFetchData } from "../hooks/useFetchData";
import { getTimeDifference } from "../helper/getTimeDifference";
import { formatDate } from "../helper/FormatDate";

const Notification = () => {
  const {userData} = useFetchData();
  const [notifications, setNotifications] = useState([]);

  useEffect(()=>{
    const user = auth.currentUser;

    if(user){
      const userNotificationRef = ref(database, `users/${user.uid}/notifications`);

      // Listen for changes in the notifications data
      onValue(userNotificationRef, (snapshot)=>{
        const data = snapshot.val();

        // Convert the data object to an array of notifications
        if(data){
          const notificationList = Object.keys(data).map((key) =>({
            id: key,
            ...data[key]
          }));

          // update the state with the fetched notificaitons
          setNotifications(notificationList);
        } else{
          // handle the case where there are no notifications
          setNotifications([]);
        }
      });
    }
  }, []);

  return (
    <ScrollView>
      <View className="h-full w-full">
        {notifications.map((notifications) => (
          <View key={notifications.id} className="flex flex-row justify-between p-4 bg-gray-50">
            <View className="">
              <Image
                source={{ uri: notifications.img }}
                className="rounded-full h-12 w-12 border-4 border-blue-500"
              />
            </View>
            <View className="pl-4 flex-1">
              <View className="text-sm mb-1 text-gray-600 dark:text-gray-300">
                <Text className="font-semibold text-lg text-gray-800 dark:text-white">
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
      </View>
    </ScrollView>
  );
};

export default Notification;
