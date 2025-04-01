import { database } from "../services/firebaseConfig";
import { ref, remove } from "firebase/database";
import { useState } from "react";
import { Alert, ToastAndroid } from "react-native";

const useDeleteData = () => {
  const [loading, setLoading] = useState(false);

  const handleDeleteData = async (id, dataType) => {
    const dataRef = ref(database, `${dataType}/${id}`);

    try {
      if (id) {
        setLoading(true);
        await remove(dataRef);
        ToastAndroid.show(
          "Deleted Successfully",
          ToastAndroid.BOTTOM,
          ToastAndroid.SHORT
        );
        console.log(`successfully delete ${id}`);
      }
    } catch (error) {
      console.error("Notification error: ", error);
      Alert.alert("Error occurred", `${error}`);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return { handleDeleteData, loading };
};

export default useDeleteData;
