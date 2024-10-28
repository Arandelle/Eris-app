import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { auth, database } from "../services/firebaseConfig";
import { ref, serverTimestamp, push, update, remove } from "firebase/database";
import useLocationTracking from "../hooks/useLocationTracking";
import useFetchData from "../hooks/useFetchData";
import useCurrentUser from "../hooks/useCurrentUser";
import { generateUniqueBarangayID } from "../helper/generateID";
import useSendNotification from "../hooks/useSendNotification";

const Request = () => {
  const [emergencyExpired, setEmergencyExpired] = useState(false);
  const [hasActiveRequest, setHasActiveRequest] = useState(false);
  const [emergencyDone, setEmergencyDone] = useState(false);
  const [emergencyType, setEmergencyType] = useState("");
  const [description, setDescription] = useState("");
  const { sendNotification } = useSendNotification(emergencyType, description);
  const [newRequestKey, setNewRequestKey] = useState(null);
  const [refreshing, setRefreshing] = useState(false); // To track refresh state

  const { currentUser } = useCurrentUser();
  const { data: responderData } = useFetchData("responders");
  const { data: emergencyRecords } = useFetchData("emergencyRequest");
  const { location, latitude, longitude, geoCodeLocation, trackUserLocation } =
    useLocationTracking(currentUser, setRefreshing);

  useEffect(() => {
    const checkAndHandleRequestStatus = async () => {
      if (currentUser && currentUser.activeRequest) {
        const { activeRequest } = currentUser;
        const requestId = activeRequest?.requestId;
        const emergencyData = emergencyRecords.find(
          (emergency) => emergency.id === requestId
        );

        // Set active request status
        setHasActiveRequest(true);

        // Check if the request has expired
        const now = new Date().getTime();
        const expiresAt = new Date(emergencyData?.expiresAt).getTime();

        if (now > expiresAt) {
          // Update request status to "expired" in Firebase
          const requestRef = ref(database, `emergencyRequest/${requestId}`);
          const historyRef = ref(
            database,
            `users/${currentUser.id}/emergencyHistory/${requestId}`
          );
          const userRef = ref(
            database,
            `users/${currentUser?.id}/activeRequest`
          );

          try {
            await update(requestRef, { status: "expired" });
            await update(historyRef, { status: "expired" });

            // Remove activeRequest from the user
            await remove(userRef);

            // Update local state
            setHasActiveRequest(false);
            setEmergencyExpired(true);
            setEmergencyDone(false);
          } catch (error) {
            console.error("Error updating Firebase:", error);
          }
        } else if (activeRequest.status === "resolved") {
          setHasActiveRequest(false);
          setEmergencyExpired(false);
          setEmergencyDone(true);
        } else {
          setEmergencyExpired(false);
          setEmergencyDone(false);
        }
      } else {
        // No active request found
        setHasActiveRequest(false);
        setEmergencyExpired(false);
        setEmergencyDone(false);
      }
    };

    checkAndHandleRequestStatus();
  }, [currentUser]);

  const handleRefresh = () => {
    setRefreshing(true); // Set refreshing to true
    trackUserLocation();
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "No user is signed in.");
      return;
    }
    if (!emergencyType || !description || !location) {
      Alert.alert("Error", "Please fill in all the fields");
      return;
    }
    if (hasActiveRequest) {
      Alert.alert(
        "Active Request",
        "You have already submitted an emergency. Please wait until it's resolved."
      );
      return;
    }

    try {
      const emergencyID = await generateUniqueBarangayID("emergency");

      const newRequest = {
        userId: user.uid,
        timestamp: serverTimestamp(),
        type: emergencyType,
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
      updates[`users/${user.uid}/emergencyHistory/${newRequestKey}`] =
        newRequest;

      // Update Firebase
      await update(ref(database), updates);
      setNewRequestKey(newRequestKey);

      // Update user's active request
      await update(ref(database, `users/${user.uid}`), {
        activeRequest: {
          requestId: newRequestKey,
          latitude,
          longitude,
        },
      });

      // Notify admins
      const adminId = "7KRIOXYy6QTW6QmnWfh9xqCNL6T2";
      await sendNotification("admins", adminId, "adminReport");

      // Notify user
      await sendNotification("users", currentUser.id, "userReport");

      // Notify responders
      responderData.forEach(async (responder) => {
        if (responder.profileComplete) {
          await sendNotification("responders", responder.id, "responderReport");
        }
      });

      Alert.alert("Emergency reported", "Help is on the way!");
      setEmergencyType("");
      setDescription("");
      setHasActiveRequest(true);
      setEmergencyExpired(false);
      setEmergencyDone(false);
    } catch (error) {
      console.error("Error submitting emergency request", error);
      Alert.alert(
        "Error",
        "Could not submit emergency report, please try again"
      );
    }
  };

  return (
    <ScrollView
      className="flex-1 p-5 bg-gray-100"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <Text className="font-bold text-xl text-center text-red-600 mb-5">
        Emergency Form
      </Text>

      {hasActiveRequest ? (
        <Text className="text-lg bg-green-100 p-4 text-gray-900 mb-5 rounded-md">
          You have an active emergency report. Please wait for it to be
          resolved.
        </Text>
      ) : emergencyExpired ? (
        <Text className="text-lg text-center text-red-600 italic mb-5">
          Your last emergency report expired. You can submit a new one if
          needed.
        </Text>
      ) : (
        emergencyDone && (
          <Text className="text-lg text-center text-blue-500 italic mb-5">
            Your last emergency report was resolved. You can submit a new one if
            needed.
          </Text>
        )
      )}

      <View className="space-y-5">
        <View>
          <Text className="text-lg mb-1 text-gray-600">Emergency Type:</Text>
          <View className="border border-gray-300 rounded-md bg-white">
            <Picker
              selectedValue={emergencyType}
              onValueChange={(itemValue) => setEmergencyType(itemValue)}
              className="h-22"
            >
              <Picker.Item label="Select type" value="" />
              <Picker.Item label="Medical Emergency" value="medical" />
              <Picker.Item label="Crime" value="crime" />
              <Picker.Item label="Noise Complaint" value="noise" />
              <Picker.Item label="Public Safety Issue" value="disaster" />
            </Picker>
          </View>
        </View>

        <View>
          <Text className="text-lg mb-1 text-gray-600">Description:</Text>
          <TextInput
            className="border p-2.5 rounded-md border-gray-300 bg-white text-sm"
            multiline
            numberOfLines={4}
            onChangeText={setDescription}
            value={description}
            placeholder="Briefly describe the emergency"
          />
        </View>

        <View>
          <Text className="text-lg mb-1 text-gray-600">Location:</Text>
          <TextInput
            className="border p-2.5 rounded-md border-gray-300 bg-gray-300 text-lg text-gray-900"
            onChangeText={geoCodeLocation}
            value={location}
            placeholder="Your current location"
            editable={false} // Read-only
          />
        </View>
        <TouchableOpacity
          className="bg-red-600 p-3.5 rounded-md items-center"
          onPress={handleSubmit}
        >
          <Text className="text-white text-lg font-bold">Submit Emergency</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Request;
