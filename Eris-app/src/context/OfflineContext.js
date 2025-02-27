import { useState, useEffect, createContext } from "react";
import NetInfo from "@react-native-community/netinfo";
import { Alert, ToastAndroid } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { submitEmergencyReport } from "../hooks/useSubmitReport";

export const OfflineContext = createContext();

export const OfflineProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [storedData, setStoredData] = useState({});

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);

      if (state.isConnected) {
        syncOfflineData();
      }
    });

    loadAllStoredData();

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
        const parsedData = JSON.parse(storedValue);
        setStoredData((prev) => ({ ...prev, [key]: parsedData }));
        return parsedData; // Add this line to return data
      }
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
    }
    return null; // Ensure function returns null if no data found
  };
  

  // **Load all necessary stored data on app start**
  const loadAllStoredData = async () => {
    const keys = [
      "offlineRequest",
      "currentUser",
      "users",
      "hotlines",
      "announcement",
      "admins",
      "activeRequestData",
    ];
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
      console.log("Success", `${key} removed successfully!`);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  };

  // **Sync offline data when back online**
  const syncOfflineData = async () => {
    setLoading(true);
    const now = Date.now();
    const THIRTY_MINUTES = 30 * 60 * 1000;
  
    let storedRequest = storedData?.offlineRequest;
  
    // If not found, try fetching from storage
    if (!storedRequest) {
      console.log("Fetching offline request from storage...");
      storedRequest = await loadStoredData("offlineRequest");
    }
  
    if (!storedRequest) {
      console.log("No offline request found in storage.");
      Alert.alert("No offline request", "There is no pending offline request.");
      setLoading(false);
      return;
    }
    if (now - storedRequest.timestamp > THIRTY_MINUTES) {
      console.log("Offline request expired, deleting from storage");
      await removeStoredData("offlineRequest");
      Alert.alert(
        "Time limit",
        "Your last emergency report exceeded the time limit, please report a new emergency if needed!"
      );
      setLoading(false);
      return;
    }
  
    try {
      console.log("Syncing valid offline request", storedRequest);
      await submitEmergencyReport({ data: storedRequest });
      await removeStoredData("offlineRequest");
      Alert.alert("Back Online", "Your pending emergency request has been sent!");
    } catch (error) {
      console.error("Error syncing offline data: ", error);
      Alert.alert("Error", `Could not submit emergency report: ${error}`);
    }
  
    setLoading(false);
  };
  

  return (
    <OfflineContext.Provider
      value={{
        isOffline,
        saveStoredData,
        loadStoredData,
        removeStoredData,
        storedData,
        loading,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};
