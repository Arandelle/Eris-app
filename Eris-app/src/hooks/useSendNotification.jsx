import { push, ref, serverTimestamp } from "firebase/database";
import { database } from "../services/firebaseConfig";
import { Alert } from "react-native";
import useCurrentUser from "./useCurrentUser";

const useSendNotification = (description = "N/A") => {
  const { currentUser } = useCurrentUser();
  const fullName = [currentUser?.firstname,currentUser?.lastname].filter(Boolean).join(' ') || "Anonymous";

  const sendNotification = async (dataType, userId, messageType, additionalId) => {

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
      welcomeUser : {
        ...mainNotificationData,
        title: "Welcome!",
        message: "You have successfully created your account",
        icon: "account-alert"
      },
      welcomeGuest : {
        ...mainNotificationData,
        title: "Welcome!",
        message: "Feel free to explore the app",
        icon: "account-alert"
      },
      userGuest : {
        ...mainNotificationData,
        userId: additionalId,
        title: "New user",
        message: "A new guest has login with the system",
        icon: "account-check"
      },
      userCreatedAccount : {
        ...mainNotificationData,
        userId: additionalId,
        title: "New user",
        message: "A new user has registered with the system",
        icon: "account-check"
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
        message: `${fullName} has new emergency report`,
        description,
        icon: "hospital-box",
      },
      responderReport: {
        ...mainNotificationData,
        userId: currentUser?.id,
        message: `${fullName} has new emergency report`,
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
      Alert.alert("Error", "Error submitting notification");
    }
  };

  return { sendNotification };
};

export default useSendNotification;
