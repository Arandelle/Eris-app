import { useState, useEffect } from "react";
import { ref, get, update } from "firebase/database";
import { auth, database } from "../services/firebaseConfig";

const useActiveRequest = (userData) => {
  const [emergencyExpired, setEmergencyExpired] = useState(false);
  const [hasActiveRequest, setHasActiveRequest] = useState(false);
  const [emergencyAccepted, setEmergencyAccepted] = useState(false);

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
        const emergencyRef = ref(
          database,
          `emergencyRequest/${userData.activeRequest.requestId}`
        );
        const emergencySnapshot = await get(emergencyRef);
        const emergencyData = emergencySnapshot.val();

        if (emergencyData) {
          const now = new Date().getTime();
          const expiresAt = new Date(emergencyData.expiresAt).getTime();

          if (now > expiresAt && emergencyData.status === "pending") {
            await update(emergencyRef, { status: "expired" });
            setEmergencyExpired(true);
            setHasActiveRequest(false);
            Alert.alert(
              "Request Expired",
              "Your last emergency request has expired"
            );
          } else if (emergencyData.status === "pending") {
            setHasActiveRequest(true);
          } else if (emergencyData.status === "accepted") {
            setEmergencyAccepted(true);
          } else {
            setHasActiveRequest(false);
          }
        }
      } else {
        setHasActiveRequest(false);
      }
    }
  };

  return {
    checkActiveRequest,
    emergencyExpired,
    setEmergencyExpired,
    emergencyAccepted,
    setEmergencyAccepted,
    hasActiveRequest,
    setHasActiveRequest,
  };
};

export default useActiveRequest;
