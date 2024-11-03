import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../services/firebaseConfig";
import { signOut } from "firebase/auth";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import useCurrentUser from "../hooks/useCurrentUser";
import colors from "../constant/colors";

const Profile = () => {
  const { currentUser } = useCurrentUser();
  const navigation = useNavigation();
  const [logout, setLogout] = useState(false);

  const handleShowUpdateForm = () => {
    navigation.navigate("UpdateProfile");
  };

  const handleLogoutModal = () => {
    setLogout(!logout);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate("Login");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <ScrollView>
    
        <View className="flex-1 justify-between bg-white rounded-lg m-4 p-5 space-y-2 shadow-md">
          <View className="items-center border-b-2 border-b-gray-300">
            <View className="relative">
              {currentUser?.img ? (
                <Image
                  source={{ uri: currentUser.img }}
                  className="h-[80px] w-[80px] rounded-full"
                />
              ) : (
                <Text className="text-gray-900 text-lg">
                  Image not available
                </Text>
              )}
              <TouchableOpacity
                className="absolute bottom-0 right-0 rounded-full p-2 bg-white"
                onPress={handleShowUpdateForm}
              >
                <Icon name="pencil" size={18} color={colors.blue[500]} />
              </TouchableOpacity>
            </View>
            <View className="text-2xl font-bold p-2">
              {currentUser?.firstname || currentUser?.lastname ? (
                <Text className="text-xl text-gray-600 font-bold">
                  {[currentUser?.firstname, currentUser?.lastname]
                    .filter(Boolean)
                    .join(" ")}
                </Text>
              ) : (
                <Text className="italic text-xl text-gray-900">
                  Your fulname
                </Text>
              )}
            </View>
          </View>
          <View className="mb-5 space-y-8 py-2">
            <Text className="italic font-bold bg-blue-100 text-blue-600 p-2 text-lg rounded-md">
              {currentUser?.customId}
            </Text>
            <View>
              <Text className="text-xl font-bold mb-2 ">Contact:</Text>
              <View className="flex flex-col justify-between space-y-1">
                <Text className="text-lg text-gray-500 font-bold">
                  {currentUser?.email}
                </Text>
                <Text className="text-lg text-gray-500 font-bold">
                  {currentUser?.mobileNum || "not yet set"}
                </Text>
              </View>
            </View>
            <View>
              <Text className="text-xl font-bold mb-2 ">
                Gender:{" "}
                <Text className="text-lg text-gray-500 font-bold">
                  {currentUser?.gender ? currentUser?.gender : "Your gender"}
                </Text>
              </Text>
            </View>

            {!currentUser?.profileComplete && (
              <View className="p-4 bg-indigo-50 border-l-4 border-indigo-400 rounded-md">
                <View className="flex flex-row items-center gap-2">
                  <Icon name={"shield"} color={colors.blue[500]} size={20} />
                  <Text className="text-gray-800 text-lg font-medium">
                    Finish Setting Up Your Profile
                  </Text>
                </View>
                <Text className="text-gray-600 mt-1">
                  Complete your profile to ensure faster assistance during
                  emergencies
                </Text>
              </View>
            )}
          </View>
          <View className="">
            <TouchableOpacity
              className="p-3 bg-blue-500 rounded-full"
              onPress={handleLogoutModal}
            >
              <Text className="text-center text-xl text-white font-bold">
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={logout}
        onRequestClose={() => setLogout(false)}
      >
        <TouchableWithoutFeedback onPress={() => setLogout(false)}>
          <View
            className="flex w-full h-full py-14 items-center justify-center"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <View className="h-56 justify-center bg-white w-full absolute bottom-0 rounded-t-xl">
              <View className="space-y-3">
                <Text className="text-gray-900 font-extrabold text-2xl text-center">
                  Are you sure you want to logout?
                </Text>
                <View className="space-y-3 py-3 px-5">
                  <TouchableOpacity
                    className="p-3 w-full bg-blue-600 rounded-2xl"
                    onPress={handleLogout}
                  >
                    <Text className="text-white text-lg text-center font-extrabold">
                      Confirm
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="p-3 w-full border-2 border-blue-500 rounded-2xl"
                    onPress={handleLogoutModal}
                  >
                    <Text className="text-center text-lg font-extrabold text-blue-500">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;
