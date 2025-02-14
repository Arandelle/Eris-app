import React, { useState, useRef } from "react";
import { View, Button, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";

const VideoPlayer = () => {
  const [videoUri, setVideoUri] = useState(null);
  const videoRef = useRef(null);

  // Function to pick a video
  const pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setVideoUri(result.assets[0].uri); // Get the selected video URI
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {videoUri && (
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          style={{ width: 300, height: 200 }}
          useNativeControls
          resizeMode="contain"
        />
      )}

      <Button title="Pick Video from Gallery" onPress={pickVideo} />
      <Button
        title="Play Video"
        onPress={() => videoRef.current?.playAsync()}
        disabled={!videoUri}
      />
    </View>
  );
};

export default VideoPlayer;
