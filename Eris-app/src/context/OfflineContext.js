import { useState, useEffect, createContext } from "react";
import NetInfo from "@react-native-community/netinfo";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { submitEmergencyReport } from "../hooks/useSubmitReport";

export const OfflineContext = createContext();

export const OfflineProvider = ({ children }) => {
  const [isOffline, setIsOffline] = useState(false);
  const [storedData, setStoredData] = useState({});


  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);

      if (state.isConnected) {
        syncOfflineData(); // it will send the data from offLineRequest to firebase when back online (isConnected) 
      }
    });

    loadAllStoredData(); // Load all stored data when the app starts

    return () => unsubscribe();
  }, []);

  // **Dynamic function to save data**
  const saveStoredData = async (key, data) => {
    try {
      const existingData = storedData[key];
      
      if (JSON.stringify(existingData) !== JSON.stringify(data)) {
        await AsyncStorage.setItem(key, JSON.stringify(data));
        setStoredData((prev) => ({ ...prev, [key]: data }));
        console.log("Offline Mode", `${key} saved successfully!`);
      }
    } catch (error) {
      Alert.alert("Error", `Failed to save ${key}.`);
      console.error(error);
    }
  };
  

  // **Dynamic function to load data**
  const loadStoredData = async (key) => {
    try {
      const storedValue = await AsyncStorage.getItem(key);
      if (storedValue) {
        setStoredData((prev) => ({ ...prev, [key]: JSON.parse(storedValue) }));
      }
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
    }
  };

  // **Load all necessary stored data on app start**
  const loadAllStoredData = async () => {
    const keys = ["offlineRequest", "currentUser", "hotlines", "announcement", "admins"];
    let allData = {};
  
    for (const key of keys) {
      try {
        const storedValue = await AsyncStorage.getItem(key);
        if (storedValue) {
          allData[key] = JSON.parse(storedValue);
        }
      } catch (error) {
        console.error(`Error loading ${key}:`, error);
      }
    }
  
    setStoredData(allData); // Update state once with all data
  };
  

  // **Remove stored data dynamically**
  const removeStoredData = async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      setStoredData((prev) => {
        const updatedData = { ...prev };
        delete updatedData[key];
        return updatedData;
      });
      Alert.alert("Success", `${key} removed successfully!`);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  };

  // **Sync offline data when back online**
  const syncOfflineData = async () => {
    const now = Date.now();
    const THIRTY_MINUTES = 30 * 60 * 1000;
  
    if (storedData.offlineRequest) {
      const { timestamp, ...requestData } = storedData.offlineRequest;
  
      // Check if request is still valid (within 30 minutes)
      if (now - timestamp > THIRTY_MINUTES) {
        console.log("Offline request expired, deleting from storage.");
        await removeStoredData("offlineRequest");
        Alert.alert("Time Limit", "Your last emergency report exceeded to time limit, please report new emergency if needed!")
        return;
      }
  
      try {
        console.log("Syncing offline request:", requestData);
        await submitEmergencyReport({...requestData });
        await removeStoredData("offlineRequest");
  
        Alert.alert("Online", "Your pending emergency request has been sent!");
      } catch (error) {
        console.error("Error syncing offline data:", error);
      }
    }
  };
  

  return (
    <OfflineContext.Provider
      value={{
        isOffline,
        saveStoredData,
        loadStoredData,
        removeStoredData,
        storedData,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};
