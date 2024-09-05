import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { auth, database } from "../services/firebaseConfig";
import { Alert } from "react-native";

const useFetchHistory = (showHistory) => {

    const [emergencyHistory, setEmergencyHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      const user = auth.currentUser;

      if(user){
        const historyRef = ref(database, `users/${user.uid}/emergencyHistory`);
        const unsubscribe = onValue(historyRef, (snapshot) => {
          try{
            const historyData = snapshot.val();
            if(historyData){
              const historyList = Object.keys(historyData).map((key) => ({
                id: key,
                ...historyData[key],
              }));
              setEmergencyHistory(historyList);
            } else{
              setEmergencyHistory([]);
            }
            setLoading(false);
          } catch(error){
            console.error("Error: ", error);
            Alert.alert("Error Fetching History: ", error.message);
            setLoading(false)
          }
        });

        return ()=> unsubscribe();
      }
    }, [showHistory])

  return {emergencyHistory}
}

export default useFetchHistory
