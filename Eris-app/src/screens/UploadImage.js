import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

// Rename to useUploadImage to follow hook naming convention
const useUploadImage = () => {
  const [photo, setPhoto] = useState(null);

  // Function to select a photo from the gallery
  const selectPhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission to access media library is required!", "Please confirm");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  // Function to take a photo using the camera
  const takePhoto = async () => {
    console.log("Take photo");
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync(); // Request camera permission
    if (!permissionResult.granted) {
      Alert.alert("Permission to access camera is required!", "Please confirm");
      return;
    };

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if(!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  // Function to choose between gallery and camera
  const choosePhoto = async () => {
    Alert.alert(
      "Choose an image source",
      "Select an image source to upload",
      [
        {
          text: "Gallery",
          onPress: selectPhoto,
        },
        {
          text: "Camera",
          onPress: takePhoto,
        },
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
      ],
      { cancelable: false }
    );
  }

  return { photo,choosePhoto};
};

export default useUploadImage;