import { useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { useFetchData } from "../hooks/useFetchData";
import { getTimeDifference } from "../helper/getTimeDifference";
import { formatDate } from "../helper/FormatDate";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { useNotificationData } from "../hooks/useNotificationData";

const Notification = () => {
  const navigation = useNavigation();
  const { userData } = useFetchData();
  const {notifications, handleSpecificNotification } = useNotificationData();
  const [viewAll, setViewAll] = useState(false);

  const displayedNotifications = viewAll ? notifications : notifications.slice(0,7);

  const notificationData = {
    users: "bg-red-500",
    updateProfile: "bg-blue-500",
  };

  return (
    <ScrollView>
      <View className="h-full w-full">
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            onPress={() => {
              handleSpecificNotification(notification.id);
              if (userData?.profileComplete) {
                navigation.navigate("Profile");
              } else {
                navigation.navigate("UpdateProfile");
              }
            }}
          >
            <View
              className={`flex flex-row justify-between p-4 ${
                notification.isSeen ? "bg-gray-200" : "bg-white"
              }`}
            >
              <View className="relative">
                <Image
                  source={{ uri: notification.img }}
                  className="rounded-full h-14 w-14 border-4 border-blue-500"
                />
                <View
                  className={`absolute bottom-0 right-0 ${
                    notificationData[notification.type]
                  } rounded-full p-1 border-2 border-white`}
                >
                  <Icon name={notification.icon} size={16} color={"white"} />
                </View>
              </View>
              <View className="pl-4 flex-1">
                <View className="text-sm mb-1 text-gray-600 dark:text-gray-300">
                  <Text className="font-semibold text-lg text-gray-800">
                    {notification.title}
                  </Text>
                  <Text>{notification.message.toUpperCase()}</Text>
                </View>
                <View className="flex flex-row justify-between text-xs text-gray-500 dark:text-gray-400">
                  <Text>{getTimeDifference(notification.timestamp)}</Text>
                  <Text className="text-blue-500 dark:text-green-400">
                    {formatDate(notification.date)}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default Notification;
