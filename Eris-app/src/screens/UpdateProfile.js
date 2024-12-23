import { useState, useEffect } from "react";
import {
  View,
  Alert,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ref, onValue } from "firebase/database";
import { auth, database } from "../services/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import CustomInput from "../component/CustomInput";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import useCurrentUser from "../hooks/useCurrentUser";
import useSendNotification from "../hooks/useSendNotification";
import useUploadImage from "./UploadImage";
import { storage } from "../services/firebaseConfig";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

const UpdateProfile = () => {
  const { photo, selectPhoto } = useUploadImage(); //hooks for uploading photo
  const navigation = useNavigation();
  const { sendNotification } = useSendNotification();
  const { currentUser, updateCurrentUser } = useCurrentUser();
  const [userData, setUserData] = useState({
    mobileNum: "",
    firstname: "",
    lastname: "",
    gender: "Prefer not to say",
    img: "https://flowbite.com/docs/images/people/profile-picture-1.jpg",
    imageFile: null,
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({ mobileNum: "", age: "" });
  const [valid, setValid] = useState(true);

  const genders = ["Male", "Female", "Prefer not to say"];

  useEffect(() => {
    // This useEffect ensures the check icon appears immediately after the user selects an image from their gallery.
    // It automatically updates the `userData` object with the chosen image,
    // so the user doesn't need to click the image again to confirm their selection.
    if (photo) {
      setUserData({
        ...userData,
        img: null, // Set img to null when a photo is selected to ensure the check icon doesn't appear for img.
        imageFile: photo, // Set imageFile to the selected photo URI.
      });
    }
  }, [photo]); // Depend on photo, so this useEffect runs every time photo changes.

  const imageUrls = [
    ...Array.from(
      { length: 5 },
      (_, i) =>
        `https://flowbite.com/docs/images/people/profile-picture-${i + 1}.jpg`
    ),
    ...Array.from(
      { length: 99 },
      (_, i) => `https://api.multiavatar.com/${i + 1}.png`
    ),
  ];

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) setUserData(data);
          setLoading(false);
        });
      } else {
        navigation.navigate("Login");
      }
    });
    return unsubscribeAuth;
  }, [navigation]);

  const validateInput = (field, value) => {
    const errorsCopy = { ...errors }; // Copy existing errors

    if (value) {
      switch (field) {
        case "mobileNum":
          if (!/^(09\d{9}|\+639\d{9})$/.test(value)) {
            errorsCopy.mobileNum = "Please enter a valid PH contact number";
            setValid(false);
          } else {
            delete errorsCopy.mobileNum; // Clear error if valid
            setValid(true);
          }
          break;
      }
    }

    setErrors(errorsCopy); // Update state with new errors
  };

  const handleFieldChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
    validateInput(field, value);
  };

  const handleUpdateProfile = async () => {
    setLoading(true);

    let imageUrl = userData.img; // Default to current image URL

    // Check if there's a new image to upload
    if (userData.imageFile) {
      const imageRef = storageRef(storage, `profile-images/${Date.now()}.jpg`);

      try {
        const response = await fetch(userData.imageFile);
        const blob = await response.blob();
        await uploadBytes(imageRef, blob);
        imageUrl = await getDownloadURL(imageRef); // Get the new image URL
      } catch (error) {
        console.error("Error uploading profile image: ", error);
        Alert.alert("Error", "Failed to upload profile image.");
        setLoading(false);
        return;
      }
    }

    // Delete old image if exist
    if (currentUser?.img) {
      try {
        const oldImageRef = storageRef(storage, currentUser?.img);
        await deleteObject(oldImageRef);
      } catch (deleteError) {
        console.warn("Error deleting old image:", deleteError);
        // Not a critical error, so we continue
      }
    }

    const updatedData = {
      ...userData,
      img: imageUrl, // Use the uploaded image URL
      email: auth.currentUser.email,
      profileComplete: Boolean(
        userData.firstname &&
          userData.lastname &&
          userData.mobileNum &&
          userData.gender &&
          imageUrl
      ),
    };

    try {
      await updateCurrentUser(updatedData); // Update user profile in your database
      await sendNotification("users", currentUser.id, "userProfileUpdate"); // Notify about profile update
      Alert.alert("Success", "Profile updated successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating profile: ", error);
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );

  return (
    <SafeAreaView className="flex-1">
      <ScrollView>
        <View className="p-4">
          <Text className="text-lg  text-blue-800 font-bold">Avatar:</Text>

          {/**List of avatar in horizontal */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex py-4 flex-row items-center space-x-3 justify-center">
              <TouchableOpacity onPress={selectPhoto}>
                <View className="h-16 w-16 rounded-full bg-gray-200 flex justify-center items-center">
                  <Icon name="camera" size={40} color={"gray"}/>
                </View>
              </TouchableOpacity>

              {currentUser?.img && (
                <TouchableOpacity
                  onPress={() => setUserData({ ...userData, imageFile: photo })}
                >
                  <View className="h-16 w-16 rounded-full bg-gray-200 flex justify-center items-center relative">
                      <Image
                        source={{ uri: photo || currentUser?.img}}
                        className="w-16 h-16 rounded-full"
                      />
                    {userData.imageFile && (
                      <View className="absolute top-0 right-0 bg-white rounded-full">
                        <Icon
                          name="checkbox-marked-circle"
                          size={20}
                          color="green"
                        />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )}

              {imageUrls.map((url) => (
                <TouchableOpacity
                  key={url}
                  onPress={() =>
                    setUserData({ ...userData, img: url, imageFile: null })
                  }
                  className="relative"
                >
                  <Image
                    source={{ uri: url }}
                    className="h-16 w-16 rounded-full"
                  />
                  {userData.img === url && (
                    <View className="absolute top-0 right-0 bg-white rounded-full">
                      <Icon
                        name="checkbox-marked-circle"
                        size={20}
                        color="green"
                        className="absolute top-0 right-0"
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <CustomInput
            label="First Name"
            value={userData.firstname}
            onChangeText={(value) => handleFieldChange("firstname", value)}
            placeholder="Enter your firstname"
          />
          <CustomInput
            label="Last Name"
            value={userData.lastname}
            onChangeText={(value) => handleFieldChange("lastname", value)}
            placeholder="Enter your lastname"
          />
          <CustomInput
            label="Mobile phone"
            value={userData.mobileNum}
            onChangeText={(value) => handleFieldChange("mobileNum", value)}
            placeholder="Enter your mobile number"
            errorMessage={errors.mobileNum}
          />

          <Text className="text-lg mb-1 text-blue-800 font-bold">
            Select Gender:
          </Text>
          <View className="flex-row justify-around p-2 mb-2">
            {genders.map((gender) => (
              <TouchableOpacity
                key={gender}
                onPress={() => setUserData({ ...userData, gender })}
                className={`flex flex-row items-center my-1`}
              >
                <View className="h-6 w-6 rounded-full border-2 border-blue-800 justify-center items-center">
                  {userData.gender === gender && (
                    <View className="h-3 w-3 rounded-full bg-blue-800" />
                  )}
                </View>
                <Text className="ml-2 font-bold">{gender}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            className={`p-3 w-full rounded-2xl ${
              !valid ? "bg-gray-400" : "bg-blue-800"
            }`}
            onPress={handleUpdateProfile}
            disabled={!valid}
          >
            <Text className="text-center text-lg font-extrabold text-white">
              Update Profile
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UpdateProfile;
