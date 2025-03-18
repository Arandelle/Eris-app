import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Text,
  TextInput
} from "react-native";
import colors from "../constant/colors";
import { handleAccountLinking } from "../hooks/useLinkAnonymous";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import logAuditTrail from "../hooks/useAuditTrail";

const LinkEmailModal = ({
  isLinkingAccount,
  setIsLinkingAccount,
  isVerified,
  auth,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await handleAccountLinking(auth, email, password);
      await logAuditTrail("Linked an email");

      if (result) {
        // Show success message
        alert(
          "Account successfully linked! Please check your email for verification."
        );
      }
    } catch (error) {
      // Show error message
      alert("Failed to link account. Please try again.");
    }
  };


  return (
    <Modal
      visible={isLinkingAccount}
      transparent={true}
      onRequestClose={() => setIsLinkingAccount(false)}
      animationType="slide"
    >
      <ScrollView>
        <TouchableWithoutFeedback onPress={() => setIsLinkingAccount(false)}>
          <View
            className="h-screen w-full flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <View className="w-full flex  justify-center p-4 rounded-lg space-y-6 bg-white shadow-xl">
              <View className="space-y-2">
                <Text className="font-bold text-green-600 text-2xl">
                  Link your account
                </Text>
                <Text className="text-gray-500 text-md">
                  To make it easier to access your account in the future, please
                  link an email and password. This will let you log in directly
                  without using guest access
                </Text>
                {!isVerified && auth.currentUser?.email && (
                  <Text className="text-gray-500 text-lg">
                    Verify this email{" "}
                    <Text className="text-red-500">
                      {auth.currentUser.email}
                    </Text>
                  </Text>
                )}
              </View>
              {!isVerified && !auth.currentUser?.email && (
                <View className="space-y-6">
                  <View className="relative z-10">
                    <View className="flex items-center absolute top-4 left-3 z-50">
                      <Icon
                        name={"email"}
                        size={20}
                        color={colors.green[600]}
                      />
                    </View>
                    <TextInput
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-green-800 focus:border-green-800 w-full ps-10 p-2.5 pl-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-800 dark:focus:border-blue-800"
                      placeholder={"Email"}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      onChangeText={setEmail}
                      value={email}
                    />
                  </View>

                  <View className="relative z-10">
                    <View className="flex items-center absolute top-4 left-3 z-50">
                      <Icon name="lock" size={20} color={colors.green[600]} />
                    </View>
                    <TextInput
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-green-800 focus:border-green-800 w-full ps-10 p-2.5 pl-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-800 dark:focus:border-blue-800"
                      onChangeText={setPassword}
                      value={password}
                      placeholder="Password"
                      secureTextEntry
                    />
                    <TouchableOpacity className="absolute right-4 top-4 flex items-center">
                      <Icon name="eye" size={20} color={colors.green[600]} />
                    </TouchableOpacity>
                  </View>

                  <View>
                    <TouchableOpacity
                      className="w-full bg-green-600 p-3 rounded-lg shadow-lg"
                      onPress={handleSubmit}
                    >
                      <Text className="text-center text-lg text-white font-bold">
                        Save account details
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </Modal>
  );
};

export default LinkEmailModal;
