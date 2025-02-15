import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

const useUploadImage = (mode = "both") => {
  const [file, setFile] = useState({ uri: null, type: null });

  // Function to select a file from the gallery
  const selectFile = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "You need to enable access to your gallery.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mode === "image" ? ['images'] : ['images', 'videos'], // Image only for profile, both for uploads
      allowsEditing: mode === "image", // Allow editing only for profile pictures
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];

      if (mode === "image" && asset.type !== "image") {
        Alert.alert("Invalid Selection", "Please select an image file.");
        return;
      }

      setFile({ uri: asset.uri, type: asset.type });
    }
  };

  // Function to take a photo using the camera
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "You need to enable access to your camera.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only images for camera
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setFile({ uri: result.assets[0].uri, type: "image" });
    }
  };

  // Function to choose between gallery and camera
  const chooseFile = async () => {
    Alert.alert(
      "Choose a Source",
      `Select a ${mode === "image" ? "profile picture" : "file"} source`,
      [
        { text: "Gallery", onPress: selectFile },
        { text: "Camera", onPress: takePhoto },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  return { file, setFile, chooseFile };
};

export default useUploadImage;
