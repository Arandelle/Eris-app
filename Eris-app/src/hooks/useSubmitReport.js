import { ref, serverTimestamp, push, update } from "firebase/database";
import { database } from "../services/firebaseConfig";
import { generateUniqueBarangayID } from "../helper/generateID";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { storage } from "../services/firebaseConfig";
import useSendNotification from "./useSendNotification";
export const submitEmergencyReport = async ({
  data
}) => {
  const { currentUser, location, latitude, longitude, geoCodeLocation, media, description, emergencyType, hasActiveRequest, responderData } = data;
  const {sendNotification} = useSendNotification(description);
  if (!currentUser || !currentUser.id) {
    throw new Error("No user is signed in.");
  }
  if (!location) {
    throw new Error("Location is required");
  }
  if (hasActiveRequest) {
    throw new Error("You have an active emergency request pending.");
  }

  let mediaUrl = "";
  let mediaType = "";

  if (media) {

    mediaType = media.type;

    try {
      const mediaRef = storageRef(storage, `emergencyMedia/${media.uri.name}`);
      const response = await fetch(media.uri);
      const blob = await response.blob();
      await uploadBytes(mediaRef, blob);
      mediaUrl = await getDownloadURL(mediaRef);
    } catch (error) {
      console.warn("Failed to upload image:", error.message);
      mediaUrl = ""; // Proceed without the image
    }
  }

  try {
    const emergencyID = await generateUniqueBarangayID("emergency");

    const newRequest = {
      userId: currentUser.id,
      timestamp: serverTimestamp(),
      description,
      media: {
        mediaUrl,
        mediaType
      },
      emergencyType,
      status: "awaiting response",
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min validity
      date: new Date().toISOString(),
      emergencyId: emergencyID,
      location: {
        latitude,
        longitude,
        geoCodeLocation
      },
    };

    // Generate a new key for the emergency request
    const emergencyRequestRef = ref(database, "emergencyRequest");
    const newRequestRef = push(emergencyRequestRef);
    const newRequestKey = newRequestRef.key;

    // Prepare updates
    const updates = {};
    updates[`emergencyRequest/${newRequestKey}`] = {
      ...newRequest,
      id: newRequestKey,
    };
    updates[`users/${currentUser.id}/emergencyHistory/${newRequestKey}`] = newRequest;

    // Update Firebase
    await update(ref(database), updates);

    // Update user's active request
    await update(ref(database, `users/${currentUser.id}`), {
      activeRequest: {
        requestId: newRequestKey,
        latitude,
        longitude,
      },
    });

    // Send notifications
    const adminId = "7KRIOXYy6QTW6QmnWfh9xqCNL6T2";
    await sendNotification("admins", adminId, "adminReport");
    await sendNotification("users", currentUser.id, "userReport");

    // Notify responders
    for (const responder of responderData) {
      if (responder.profileComplete) {
        await sendNotification("responders", responder.id, "responderReport");
      }
    }

    return newRequestKey;
  } catch (error) {
    console.error("Error submitting emergency request", error);
    throw error;
  }
};
