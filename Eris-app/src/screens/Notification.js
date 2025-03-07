import { useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { getTimeDifference } from "../helper/getTimeDifference";
import { formatDate } from "../helper/FormatDate";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { useNotificationData } from "../hooks/useNotificationData";
import useResponderData from "../hooks/useFetchData";
import useCurrentUser from "../hooks/useCurrentUser";

const Notification = () => {
  const { notificationsCount, notifications, markAllNotificationsAsRead } =
    useNotificationData();
  const [viewAll, setViewAll] = useState(false);

  const sortedNotification = notifications.sort((a,b) => new Date(b.date) - new Date(a.date));
  const displayedNotifications = viewAll
    ? sortedNotification
    : sortedNotification.slice(0, 6); // it's like telling viewAll is true? then show all notifications else slice it to 7

  return (
    <>
      {notificationsCount !== 0 && (
        <TouchableOpacity
          className="sticky"
          onPress={markAllNotificationsAsRead}
        >
          <Text className="bg-white p-2 text-center text-lg text-blue-500 rounded-md">
            Mark all as read
          </Text>
        </TouchableOpacity>
      )}
      <ScrollView className="bg-white">
        <View className="h-full w-full">
          {displayedNotifications.length > 0 ? (
            displayedNotifications.map((notification, key) => (
              <NotificationItem key={key} notification={notification} />
            ))
          ) : (
            <View className="flex items-center justify-center mt-60">
              <Text className="text-center text-xl text-gray-500">
                No notification found
              </Text>
            </View>
          )}

          {!viewAll &&
            notifications.length > 6 && ( // is viewAll true? and notifications is more than seven? then show the button
              <TouchableOpacity
                className="mx-3 my-2 rounded-md p-2.5 text-center text-gray-500 bg-gray-200"
                onPress={() => setViewAll(true)}
              >
                <Text className="text-center text">
                  See previous notification
                </Text>
              </TouchableOpacity>
            )}
        </View>
      </ScrollView>
    </>
  );
};

const NotificationItem = ({ notification }) => {
  const navigation = useNavigation();
  const { currentUser} = useCurrentUser()
  const { data: responderData } = useResponderData("responders");
  const { data: admin } = useResponderData("admins");
  const { handleSpecificNotification } = useNotificationData();

  const responderDetails = responderData.find(
    (responder) => responder.id === notification.responderId
  );

  const adminDetails = admin.find((admin) => admin.id === notification.adminId);

  const notificationImg = {
    "account-check": currentUser?.img,
    "account-alert": currentUser?.img,
    "hospital-box": currentUser?.img,
    "shield-check": responderDetails?.img,
    "car-emergency": responderDetails?.img,
  };

  const notificationData = {
    "account-check": "bg-blue-500",
    "account-alert": "bg-red-500",
    "hospital-box": "bg-orange-500",
    "shield-check": "bg-green-500",
    "car-emergency": "bg-red-500",
    "close-circle" : "bg-red-500",
    "clipboard-check-outline" : "bg-gray-500",
    "check-circle" : "bg-green-500"
  };

  return (
      <TouchableOpacity
        key={notification.id}
        onPress={() => {
          handleSpecificNotification(notification.id);
          switch (notification.icon) {
            case "account-check":
            case "account-alert":
              navigation.navigate("Profile");
              break;
            case "hospital-box":
              navigation.navigate("Emergency Records", {
                screen: "awaiting-response",
              });
              break;
            case "shield-check":
              navigation.navigate("Emergency Records", { screen: "resolved" });
              break;
            case "car-emergency":
              navigation.navigate("Emergency Records", { screen: "on-going" });
              break;
            case "close-circle":
            case "clipboard-check-outline":
            case "check-circle":
              navigation.navigate("Clearance");
              break;
            default:
              break;
          }
        }}
      >
        <View
          className={`flex flex-row justify-between p-4 ${
            notification.isSeen ? "bg-white" : "bg-blue-50"
          }`}
        >
          <View className="relative">
            <View>
              <Image
                source={{ uri: notificationImg[notification.icon] || adminDetails?.imageUrl}}
                className="rounded-full h-16 w-16 border-4 border-blue-500"
              />
              <View
                className={`absolute bottom-0 -right-[4px] ${
                  notificationData[notification.icon]
                } rounded-full p-1.5 border border-blue-50`}
              >
                <Icon name={notification.icon} size={18} color={"white"} />
              </View>
            </View>
          </View>
          <View className="pl-4 flex-1">
            <View className="text-sm mb-1 text-gray-600">
              <Text className="font-semibold text-lg text-gray-800">
                {notification.title}
              </Text>
              <Text className="font-semibold text-gray-500">
                {notification.message}
              </Text>
            </View>
            <View className="flex flex-row justify-between text-xs text-gray-500">
              <Text className="text-blue-500">
                {getTimeDifference(notification.timestamp)}
              </Text>
              <Text className="text-gray-500">
                {formatDate(notification.date)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
  );
};

export default Notification;
