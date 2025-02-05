import { useState, useEffect, createContext } from "react";
import NetInfo from "@react-native-community/netinfo";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const OfflineContext = createContext();

export const OfflineProvider = ({ children }) => {
  const [isOffline, setIsOffline] = useState(false);
  const [offlineData, setOfflineData] = useState(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);

      // sync data when back online
      if (state.isConnected) {
        sendStoredData();
      }
    });

    loadOfflineData();

    return () => unsubscribe();
  }, []);

  // save data locally when offline
  const saveOfflineData = async (data) => {
    try {
      await AsyncStorage.setItem("offlineRequest", JSON.stringify(data));
      setOfflineData(data);
      Alert.alert("Offline Mode: ", "Data saved offline!");
    } catch (error) {
      Alert.alert("Error", "Failed to saved offline data.");
    }
  };

  // load saved offline data
  const loadOfflineData = async () => {
    try{
        const storedData = await AsyncStorage.getItem('offlineRequest');
        if(storedData){
            setOfflineData(JSON.parse(storedData));
        }

    }catch(error){
        Alert.alert("Error loading offline data", `${error}`);
    }
  };

  // send stored Data when online

  const sendStoredData = async () => {
    if(offlineData){
        try{
            console.log('Sending offline data', offlineData);

            // send to firebase or API (replace with actual API call)

            await AsyncStorage.removeItem('offlineRequest');
            setOfflineData(null);
            Alert.alert('Online', 'Offline data synced successfully!');
        }catch(error){
            Alert.alert("Error syncing offline data", error);
    }
    }
  };

  return(
    <OfflineContext.Provider value={{isOffline, saveOfflineData}}>
        {children}
    </OfflineContext.Provider>
  );

};
