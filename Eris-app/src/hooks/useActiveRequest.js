import { useState, useEffect } from "react";
import { ref, get, update } from "firebase/database";
import { auth, database } from "../services/firebaseConfig";
import { Alert } from "react-native";

const useActiveRequest = (userData) => {
  const [emergencyExpired, setEmergencyExpired] = useState(false);
  const [hasActiveRequest, setHasActiveRequest] = useState(false);
  const [emergencyDone, setEmergencyDone] = useState(false);

  useEffect(() => {
    checkActiveRequest();
  }, [userData]);

  const checkActiveRequest = async () => {
    const user = auth.currentUser;

    if (user) {
      const userRef = ref(database, `users/${user.uid}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();

      if (userData && userData.activeRequest) {

        const requetId = userData.activeRequest.requestId;

        const emergencyRef = ref(
          database,
          `emergencyRequest/${requetId}`
        );
        const emergencySnapshot = await get(emergencyRef);
        const emergencyData = emergencySnapshot.val();

        if (emergencyData) {
          const now = new Date().getTime();
          const expiresAt = new Date(emergencyData.expiresAt).getTime();

          if (now > expiresAt && emergencyData.status === "pending") {
            const historyRef = ref(database, `users/${user.uid}/emergencyHistory/${requetId}`);
            await update(emergencyRef, { status: "expired" });
            await update(historyRef, {status: "expired"})
            setEmergencyExpired(true);
            setHasActiveRequest(false);
            Alert.alert(
              "Request Expired",
              "Your last emergency request has expired"
            );
          } else 
          if (emergencyData.status === "pending") {
            setHasActiveRequest(true);
          } else if (emergencyData.status === "done") {
            setEmergencyDone(true);
          } else {
            setHasActiveRequest(false);
          }
        }
      } else {
        setHasActiveRequest(false);
      }
    }
  };

  
  useEffect(() => {
    const checkExpiration = setInterval(checkActiveRequest, 5000);
    return () => clearInterval(checkExpiration);
  }, []);

  return {
    checkActiveRequest,
    emergencyExpired,
    setEmergencyExpired,
    emergencyDone,
    setEmergencyDone,
    hasActiveRequest,
    setHasActiveRequest,
  };
};

export default useActiveRequest;
