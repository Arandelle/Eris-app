import { useState, useEffect } from "react";
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
import useFetchDocuments from "../hooks/useFetchDocuments";
import { use } from "react";

const Profile = () => {
  const user = auth.currentUser;
  const navigation = useNavigation();
  const { currentUser } = useCurrentUser();
  const {documents} = useFetchDocuments();
  const [readyForPickup, setReadyForPickup] = useState(true);
  const [logout, setLogout] = useState(false);

  const handleLogoutModal = () => {
    setLogout(!logout);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {

    if(documents.length > 0){
      const readyDocs = documents.filter((doc) => doc.status === "ready for pickup");
      if(readyDocs.length > 0){
        setReadyForPickup(true);
      }else{
        setReadyForPickup(false);
      }
    }

  },[documents]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        <View className="flex flex-row items-center h-40 bg-blue-800 pl-8 space-x-4">
          {currentUser?.img ? (
            <View className="relative border border-white rounded-full">
              <Image
                source={{ uri: currentUser.img }}
                className="h-24 w-24  rounded-full"
              />
              <TouchableOpacity
                className="absolute bottom-0 right-0 rounded-full p-2 bg-blue-800 border border-white"
                onPress={() => navigation.navigate("UpdateProfile")}
              >
                <Icon name="pencil" size={18} color={"white"} />
              </TouchableOpacity>
            </View>
          ) : (
            <Text className="text-gray-900 text-lg">Image not available</Text>
          )}

          <View className="text-2xl space-y-1 font-bold p-2">
            {currentUser?.fullname ? (
              <View className="flex flex-row items-center space-x-2">
                <Text className="text-xl text-white font-bold">
                 {currentUser?.fullname}
                </Text>
                {user.emailVerified && (
                  <View className="p-0.5 rounded-full border border-white bg-green-500">
                    <Icon name="check" size={12} color={"white"} />
                  </View>
                )}
              </View>
            ) : (
              <>
                <Text className="font-bold text-xl text-white">
                  Update your fullname
                </Text>
              </>
            )}
            <Text className="text-blue-200">{currentUser?.customId}</Text>
          </View>
        </View>

        <View className="px-2 py-4 space-y-4">
          <View className="border-b pb-4 border-gray-300">
            <View className="space-y-4 py-4 px-6 bg-blue-100 rounded-xl">
              <View>
                <Text className="text-xl font-bold">Contact:</Text>
                <View className="flex flex-col justify-between space-y-1">
                  <Text className="text-lg text-gray-500 font-bold">
                    {currentUser?.email ?? "Add email"}
                  </Text>
                  <Text className="text-lg text-gray-500 font-bold">
                    {currentUser?.mobileNum ?? "Add mobile number"}
                  </Text>
                </View>
              </View>
              <View>
                <Text className="text-xl font-bold mb-2 ">
                  Gender:{" "}
                  <Text className="text-lg text-gray-500 font-bold">
                    {currentUser?.gender
                      ? currentUser?.gender
                      : "Update your gender"}
                  </Text>
                </Text>
              </View>

              {!currentUser?.profileComplete && (
                <View className="p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
                  <View className="flex flex-row items-center gap-2">
                    <Icon name={"shield"} color={colors.red[300]} size={20} />
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
          </View>

          <View className="space-y-4">
            {/**Emergency records */}
            <TouchableOpacity
              className="p-3 flex-row items-center justify-between bg-blue-100 rounded-lg"
              onPress={() => navigation.navigate("Emergency Records")}
            >
              <View className="flex flex-row space-x-5">
                <Icon name="history" size={24} color={colors.blue[800]} />
                <Text className="text-lg font-bold">Emergency Records</Text>
              </View>
              <Icon name="arrow-right" size={24} color={colors.blue[800]} />
            </TouchableOpacity>
            {/**Request Certification */}
            <TouchableOpacity
              className="p-3 flex-row items-center justify-between bg-blue-100 rounded-lg"
              onPress={() => navigation.navigate("Clearance")}
            >
              <View className="flex flex-row space-x-5">
                <Icon name="file-document-edit-outline" size={24} color={colors.blue[800]} />
                <Text className="text-lg font-bold">Request Barangay Certificate</Text>
              </View>
              <Icon name={readyForPickup ? "alert-circle" : "arrow-right"} size={24} color={readyForPickup ? colors.red[500] : colors.blue[800]} />
            </TouchableOpacity>
              {user.emailVerified && (
                <TouchableOpacity
              className="p-3 flex-row items-center justify-between bg-blue-100 rounded-lg"
              onPress={() => navigation.navigate("ChangePassword")}
            >
              <View className="flex flex-row space-x-5">
                <Icon name="lock" size={24} color={colors.blue[800]} />
                <Text className="text-lg font-bold">Change Password</Text>
              </View>
              <Icon name="arrow-right" size={24} color={colors.blue[800]} />
            </TouchableOpacity>
              )}


            <TouchableOpacity
              className="p-3 flex-row items-center justify-between bg-blue-100 rounded-lg"
              onPress={handleLogoutModal}
            >
              <View className="flex flex-row space-x-5">
                <Icon name="logout" size={24} color={colors.blue[800]} />
                <Text className="text-lg font-bold text-red-500">Logout</Text>
              </View>
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
                    className="p-3 w-full bg-blue-800 rounded-2xl"
                    onPress={handleLogout}
                  >
                    <Text className="text-white text-lg text-center font-extrabold">
                      Confirm
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="p-3 w-full border-2 border-blue-800 rounded-2xl"
                    onPress={handleLogoutModal}
                  >
                    <Text className="text-center text-lg font-extrabold text-blue-800">
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
