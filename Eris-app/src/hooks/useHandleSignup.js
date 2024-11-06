import { useState } from "react";
import { Alert } from "react-native";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth, database } from "../services/firebaseConfig";
import { serverTimestamp, set, ref } from "firebase/database";
import { generateUniqueBarangayID } from "../helper/generateID";
import useSendNotification from "./useSendNotification";
import { useNavigation } from "@react-navigation/native";

const useHandleSignup = () => {
  const [error, setError] = useState("");
  const navigation = useNavigation();
  const { sendNotification } = useSendNotification();

  const handleSignup = async (email, password, imageUrl) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await sendEmailVerification(user);

      const userId = await generateUniqueBarangayID("user");

      // Create a user document in the database
      const userData = {
        email: user.email,
        profileComplete: false,
        createdAt: new Date().toISOString(),
        timestamp: serverTimestamp(), // Add this line
        img: imageUrl,
        customId: userId,
      };
      await set(ref(database, `users/${user.uid}`), userData);

      console.log("User created:", userId);
      Alert.alert("Success", "Please check your email for verification", [
        {
          text: "Cancel",
          style: " cancel",
        },
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);

      const adminId = "7KRIOXYy6QTW6QmnWfh9xqCNL6T2";
      await sendNotification("admins", adminId, "userCreatedAccount", user.uid);
      await sendNotification("users", user.uid, "welcomeUser");
      return { success: true, userId };

      // Handle navigation or other logic after successful signup
    } catch (error) {
      Alert.alert("Error signing up", error.message);
      setError(error.message);
      console.error("Error signing up:", error);
    }
  };

  return { handleSignup, error };
};

export default useHandleSignup;
