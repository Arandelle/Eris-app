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
import { ref, serverTimestamp, push, onValue } from "firebase/database";
import { auth, database } from "../services/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import CustomInput from "../component/CustomInput";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import useCurrentUser from "../hooks/useCurrentUser";
import useSendNotification from "../hooks/useSendNotification";

const UpdateProfile = () => {
  const navigation = useNavigation();
  const {sendNotification} = useSendNotification()
  const { currentUser, updateCurrentUser } = useCurrentUser();
  const [userData, setUserData] = useState({
    mobileNum: "",
    firstname: "",
    lastname: "",
    age: "",
    address: "",
    gender: "Male",
    img: "https://flowbite.com/docs/images/people/profile-picture-1.jpg",
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({ mobileNum: "", age: ""});
  const [valid, setValid] = useState(true)

  const genders = ["Male", "Female"];
  const imageUrls = [
    ...Array.from(
      { length: 5 },
      (_, i) =>
        `https://flowbite.com/docs/images/people/profile-picture-${i + 1}.jpg`
    ),
    ...Array.from(
      { length: 99 },
      (_, i) => `https://robohash.org/${i + 1}.png`
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

    if(value){
      switch(field){
        case "mobileNum":
          if (!/^(09\d{9}|\+639\d{9})$/.test(value)) {
            errorsCopy.mobileNum = "Please enter a valid PH contact number";
            setValid(false)
          } else {
            delete errorsCopy.mobileNum; // Clear error if valid
            setValid(true)
          }
          break;
        
        case "age" :
          if (value < 18 || isNaN(value)) {
            errorsCopy.age = "User must be 18 years old or above";
            setValid(false)
          } else {
            delete errorsCopy.age; // Clear error if valid
            setValid(true)
          }
          break;
      }
    }

    setErrors(errorsCopy); // Update state with new errors
  };

  const handleFieldChange = (field, value) => {
    setUserData(prev => ({...prev, [field]: value}));
    validateInput(field, value)
  }

  const handleUpdateProfile = async () => {
    setLoading(true);
    const updatedData = {
      ...userData,
      email: auth.currentUser.email,
      profileComplete: Boolean(
        userData.firstname &&
          userData.lastname &&
          userData.age &&
          userData.address &&
          userData.mobileNum &&
          userData.gender &&
          userData.img
      ),
    };
    try {
      await updateCurrentUser(updatedData);
      await sendNotification("users", currentUser.id, "userProfileUpdate");
      Alert.alert("Success", "Profile update successfully");
      navigation.goBack()
    } catch (error) {
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
          <Text className="text-lg m-4 text-sky-600 font-bold">Avatar:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-3 justify-center">
              <TouchableOpacity>
                <View className="h-[70px] w-[70px] rounded-full bg-gray-200 flex justify-center items-center">
                  <Icon name="plus" size={40} color={"gray"} />
                </View>
              </TouchableOpacity>
              {imageUrls.map((url) => (
                <TouchableOpacity
                  key={url}
                  onPress={() => setUserData({ ...userData, img: url })}
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
          <CustomInput
            label="Age"
            value={userData.age}
            onChangeText={(value) => handleFieldChange("age", value)}
            placeholder="Enter your age"
            errorMessage={errors.age}
          />

          <Text className="text-lg mb-1 text-sky-600 font-bold">
            Select Gender:
          </Text>
          <View className="flex-row justify-around p-2">
            {genders.map((gender) => (
              <TouchableOpacity
                key={gender}
                onPress={() => setUserData({ ...userData, gender })}
                className={`flex flex-row items-center my-1`}
              >
                <View className="h-5 w-5 rounded-full border-2 border-blue-600 justify-center items-center">
                  {userData.gender === gender && (
                    <View className="h-3 w-3 rounded-full bg-blue-600" />
                  )}
                </View>
                <Text className="ml-2 font-bold">{gender}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <CustomInput
            label="Complete Address"
            value={userData.address}
            onChangeText={(value) => handleFieldChange("address", value)}
            placeholder="Enter your current address"
          />
           <TouchableOpacity
            className={`p-3 w-full rounded-2xl ${
              !valid ? "bg-gray-400" : "bg-green-500"
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
