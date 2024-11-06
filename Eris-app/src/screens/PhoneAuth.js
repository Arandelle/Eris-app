import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { auth } from "../services/firebaseConfig";
import { 
  PhoneAuthProvider,
  signInWithCredential 
} from "firebase/auth";

const PhoneAuth = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const sendVerificationCode = async () => {
    try {
      // Format phone number to E.164 standard
      const formattedNumber = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+${phoneNumber}`;

      const recaptchaVerifier = window.recaptchaVerifier;
      
      // Get verification ID
      const verificationId = await PhoneAuthProvider.verifyPhoneNumber(
        auth,
        formattedNumber,
        recaptchaVerifier
      );
      
      setVerificationId(verificationId);
      Alert.alert("Success", "Verification code has been sent to your phone!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message);
    }
  };

  const verifyCode = async () => {
    try {
      const credential = PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );
      
      await signInWithCredential(auth, credential);
      Alert.alert("Success", "Phone number verified successfully!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View>
      <Text>Phone Authentication</Text>
      <TextInput
        placeholder="Phone Number (e.g. +1234567890)"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      <Button title="Send Verification Code" onPress={sendVerificationCode} />
      {verificationId ? (
        <View>
          <TextInput
            placeholder="Verification Code"
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
          />
          <Button title="Verify Code" onPress={verifyCode} />
        </View>
      ) : null}
    </View>
  );
};

export default PhoneAuth;