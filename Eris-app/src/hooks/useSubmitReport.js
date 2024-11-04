import { ref, serverTimestamp, push, update } from "firebase/database";
import { database } from "../services/firebaseConfig";
import { generateUniqueBarangayID } from "../helper/generateID";

export const submitEmergencyReport = async ({
  currentUser,
  location,
  latitude,
  longitude,
  geoCodeLocation,
  description = "Emergency alert from quick response button",
  sendNotification, // Pass the notification function
  hasActiveRequest = false,
  responderData = [] // Pass responderData from the component
}) => {
  if (!currentUser) {
    throw new Error("No user is signed in.");
  }
  if (!location) {
    throw new Error("Location is required");
  }
  if (hasActiveRequest) {
    throw new Error("You have an active emergency request pending.");
  }

  try {
    const emergencyID = await generateUniqueBarangayID("emergency");

    const newRequest = {
      userId: currentUser.id,
      timestamp: serverTimestamp(),
      description,
      status: "awaiting response",
      expiresAt: new Date(Date.now() + 30000).toISOString(),
      date: new Date().toISOString(),
      emergencyId: emergencyID,
      location: {
        latitude,
        longitude,
        address: geoCodeLocation,
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
    updates[`users/${currentUser.id}/emergencyHistory/${newRequestKey}`] =
      newRequest;

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
    responderData.forEach(async (responder) => {
      if (responder.profileComplete) {
        await sendNotification("responders", responder.id, "responderReport");
      }
    });

    return newRequestKey;
  } catch (error) {
    console.error("Error submitting emergency request", error);
    throw error;
  }
};