import { useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { auth, database } from "../services/firebaseConfig";

const useFetchHistory = (showHistory) => {

    const [emergencyHistory, setEmergencyHistory] = useState([]);
    
      const fetchEmergencyHistory = async () => {
        const user = auth.currentUser;
    
        if (user) {
          const userRef = ref(database, `users/${user.uid}/emergencyHistory`);
          const historySnapshot = await get(userRef);
          const historyData = historySnapshot.val();
    
          if (historyData) {
            const emergencyPromises = Object.keys(historyData).map(async (key) => {
              const emergencyRef = ref(database, `emergencyRequest/${key}`);
              const emergencySnapshot = await get(emergencyRef);
              return { id: key, ...emergencySnapshot.val() };
            });
    
            const emergencies = await Promise.all(emergencyPromises);
            setEmergencyHistory(emergencies);
          } else {
            setEmergencyHistory([]);
          }
        }
      };

      useEffect(() => {
        if (showHistory) {
          fetchEmergencyHistory();
        }
      }, [showHistory]);

  return {emergencyHistory}
}

export default useFetchHistory
