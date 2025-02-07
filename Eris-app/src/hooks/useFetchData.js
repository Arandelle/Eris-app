import { useContext, useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../services/firebaseConfig";
import { OfflineContext } from "../context/OfflineContext";

const useFetchData = (dataType) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOffline, saveStoredData, storedData } = useContext(OfflineContext);

  useEffect(() => {
    if (isOffline) {
      // If offline, load stored data immediately
      // store or convert the object to array
      if (storedData[dataType]) {
        const offlineData = Object.keys(storedData[dataType]).map((key) => ({
          id: key,
          ...storedData[dataType][key],
        }));

        setData(offlineData);
      }
      setLoading(false);
      return; // Stop execution, don't fetch from Firebase
    }

    // Fetch data from Firebase when online
    const dataRef = ref(database, dataType);
    const unsubscribe = onValue(dataRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const dataList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        setData(dataList);
        saveStoredData(dataType, dataList); // Save to AsyncStorage
      } else {
        setData([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dataType, isOffline, storedData]);

  return { data, loading };
};

export default useFetchData;
