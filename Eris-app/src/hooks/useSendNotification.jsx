import { push, ref, serverTimestamp } from "firebase/database";
import { database } from "../services/firebaseConfig";
import { Alert } from "react-native";
import useCurrentUser from "./useCurrentUser";

const useSendNotification = (emergencyType, description) => {
  const { currentUser } = useCurrentUser();

  const sendNotification = async (dataType, userId, messageType) => {

    const mainNotificationData = {
        isSeen: false,
        date: new Date().toISOString(),
        timestamp: serverTimestamp(),
    }

    const notificationMessage = {
      userProfileUpdate: {
        ...mainNotificationData,
        title: "Profile Updated!",
        message: "Your profile was updated successfully.",
        icon: "account-check",
      },
      userReport: {
        ...mainNotificationData,
        title: "Emergency Reported!",
        message: `You have successfully reported an emergency.`,
        description,
        icon: "hospital-box",
      },
      adminReport: {
        ...mainNotificationData,
        userId: currentUser?.id,
        message: `User ${currentUser?.email} submitted an emergency: ${emergencyType}`,
        description,
        icon: "hospital-box",
      },
      responderReport: {
        ...mainNotificationData,
        userId: currentUser?.id,
        message: `New emergency reported from ${currentUser?.email}: ${emergencyType}`,
        description,
        icon: "hospital-box",
      },
    };

    try {
      const notificationRef = ref(
        database,
        `${dataType}/${userId}/notifications`
      );

      await push(notificationRef, notificationMessage[messageType]);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  return { sendNotification };
};

export default useSendNotification;
