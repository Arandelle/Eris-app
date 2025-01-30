import { useEffect, useState } from "react";
import {  View, Text, TextInput,  TouchableOpacity, Alert,ScrollView,} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import useHandleSignup from "../hooks/useHandleSignup";
import CustomInput from "../component/CustomInput";
import colors from "../constant/colors";

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [createType, setCreateType] = useState(true);
  const [isChecked, setChecked] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const { handleSignup } = useHandleSignup();

  useEffect(() => {
    const randomNumber = Math.floor(Math.random() * 5) + 1;
    const url = `https://flowbite.com/docs/images/people/profile-picture-${randomNumber}.jpg`;
    setImageUrl(url);
  }, []);

  const signUpClicked = async () => {
    if (!isChecked) {
      Alert.alert("Terms and Conditions", "Please accept Terms and Conditions");
      return;
    }

    const result = await handleSignup(email, password, imageUrl);
    if (result.success) {
      setEmail("");
      setPassword("");
    }
  };

  const toggleCheckbox = () => {
    setChecked(!isChecked);
  };

  const handleShowPass = () => {
    setShowPass(!showPass);
  };

  const handleCreateAccount = () => {
    setCreateType(!createType);
  };

  return (
    <ScrollView>
      <View className="flex items-center">
        <View className="w-full max-w-sm mt-10">
          <View className="space-y-4">
            <View className="flex flex-row space-x-6">
              <TouchableOpacity onPress={handleCreateAccount}>
                <Text
                  className={`text-xl ${
                    createType
                      ? "text-blue-800 border-b-2 pb-0.5 border-blue-800"
                      : "text-gray-400"
                  } font-extrabold`}
                >
                  Email
                </Text>
              </TouchableOpacity>
              {/* <TouchableOpacity onPress={handleCreateAccount}>
                <Text
                  className={`text-xl ${
                    !createType
                      ? "text-blue-800 border-b-2 pb-0.5 border-blue-800"
                      : "text-gray-400"
                  } font-extrabold`}
                >
                  Phone
                </Text>
              </TouchableOpacity> */}
            </View>
            <View className="space-y-2">
              <Text className="text-lg">{createType ? "Email" : "Phone"}</Text>
              <View className="relative z-10">
                <View className="flex items-center absolute top-4 left-3 z-50">
                  <Icon
                    name={createType ? "email" : "call"}
                    size={20}
                    color={colors.blue[800]}
                  />
                </View>
                <TextInput
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-800 focus:border-blue-800 w-full ps-10 p-2.5 pl-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-800 dark:focus:border-blue-800"
                  placeholder={createType ? "user@gmail.com" : "+63 912345678"}
                  autoCapitalize="none"
                  onChangeText={setEmail}
                  value={email}
                />
              </View>
            </View>
            <View className="space-y-2">
              <View className="flex flex-row items-center justify-between">
                <Text className="text-lg">Password</Text>
              </View>
              <View className="relative z-10">
                <View className="flex items-center absolute top-4 left-3 z-50">
                  <Icon name="lock" size={20} color={colors.blue[800]} />
                </View>
                <TextInput
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-800 focus:border-blue-800 w-full ps-10 p-2.5 pl-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-800 dark:focus:border-blue-800"
                  onChangeText={setPassword}
                  value={password}
                  placeholder="Type your password"
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity
                  className="absolute right-4 top-4 flex items-center"
                  onPress={handleShowPass}
                >
                  <Icon
                    name={showPass ? "visibility" : "visibility-off"}
                    size={20}
                    color={colors.blue[800]}
                  />
                </TouchableOpacity>
              </View>
                
                {/** for check box */}
              <View className="flex flex-row py-2 items-center justify-start">
                <TouchableOpacity
                  className="flex flex-row items-center"
                  onPress={toggleCheckbox}
                >
                  <View
                    className={`w-5 h-5 mr-2 border-2 rounded-full border-gray-300 bg-white items-center justify-center`}
                  >
                    {isChecked && (
                      <Icon name="check-circle" color={colors.blue[800]} size={16} />
                    )}
                  </View>
                </TouchableOpacity>

                 <View className="flex flex-row">
                    <TouchableOpacity>
                      <Text className="text-blue-800 text-lg">Terms of Service</Text>
                    </TouchableOpacity>
                    <Text className="text-lg"> and </Text>
                    <TouchableOpacity>
                      <Text className="text-blue-800 text-lg">Privacy Policy</Text>
                    </TouchableOpacity>
                 </View>
              </View>

            </View>
            <TouchableOpacity
              className="w-full bg-blue-800 p-3 rounded"
              onPress={signUpClicked}
            >
              <Text className="text-center text-lg text-white font-bold">
                Signup
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignupForm;
