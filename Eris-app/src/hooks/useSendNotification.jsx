import { push, ref, serverTimestamp } from "firebase/database";
import { database } from "../services/firebaseConfig";
import { Alert } from "react-native";
import useCurrentUser from "./useCurrentUser";

const useSendNotification = (emergencyType, description) => {
  const { currentUser } = useCurrentUser();

  const sendNotification = async (dataType, userId, messageType) => {
    const notificationMessage = {
      userProfileUpdate: {
        title: "Profile Updated!",
        message: "Your profile was updated successfully.",
        isSeen: false,
        date: new Date().toISOString(),
        timestamp: serverTimestamp(),
        icon: "account-check",
      },
      userReport: {
        title: "Emergency Reported!",
        message: `You have successfully reported an emergency.`,
        description,
        isSeen: false,
        timestamp: serverTimestamp(),
        icon: "hospital-box",
        date: new Date().toISOString(),
      },
      adminReport: {
        userId: currentUser?.id,
        message: `User ${currentUser?.email} submitted an emergency: ${emergencyType}`,
        description,
        isSeen: false,
        date: new Date().toISOString(),
        timestamp: serverTimestamp(),
        icon: "hospital-box",
      },
      responderReport: {
        userId: currentUser?.id,
        message: `New emergency reported from ${currentUser?.email}: ${emergencyType}`,
        description,
        isSeen: false,
        timestamp: serverTimestamp(),
        icon: "hospital-box",
        date: new Date().toISOString(),
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
