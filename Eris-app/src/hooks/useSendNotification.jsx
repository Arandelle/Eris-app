import { push, ref } from "firebase/database";
import { database } from "../services/firebaseConfig";
import { Alert } from "react-native";

const useSendNotification = () => {

    const handleNotifcation = async (dataType, userId, notificationData) => {
    try {
      const notificationRef = ref(
        database,
        `${dataType}/${userId}/notifications`
      );

      await push(notificationRef, notificationData);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  return { handleNotifcation };
};

export default useSendNotification;
