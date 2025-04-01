import { database } from "../services/firebaseConfig";
import { ref, remove } from "firebase/database";
import { Alert, ToastAndroid } from "react-native";

const handleDeleteData = async (id, dataType) => {
  const dataRef = ref(database, `${dataType}/${id}`);

  try {
    if (id) {
      await remove(dataRef);
      ToastAndroid.show(
        "Deleted Successfully",
        ToastAndroid.BOTTOM,
        ToastAndroid.SHORT
      );
      console.log(`successfully delete ${id}`)
    }
  } catch (error) {
    console.error("Notification error: ", error);
    Alert.alert("Error occurred", `${error}`);
  }
};

export default handleDeleteData;
