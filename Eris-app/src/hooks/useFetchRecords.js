import { useState, useEffect, useMemo } from "react";
import { ref, onValue } from "firebase/database";
import { auth, database } from "../services/firebaseConfig";
import { Alert } from "react-native";

const useFetchRecords = ({status}) => {

    const [emergencyHistory, setEmergencyHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // memoize the status array to maintain referential equality
    const statusArray = useMemo(() => {
      return Array.isArray(status) ? status : [status];

    }, [status]);
    
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
              })).filter((item) => statusArray.includes(item.status));
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
    }, [statusArray])

  return {emergencyHistory, loading}
}

export default useFetchRecords
