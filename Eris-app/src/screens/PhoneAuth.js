import React, { useState, useEffect } from 'react';
import { Button, TextInput, View } from 'react-native';
import { auth } from '../services/firebaseConfig';
import { signInWithPhoneNumber, ConfirmationResult, onAuthStateChanged } from 'firebase/auth';

const PhoneAuth = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [code, setCode] = useState('');

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, handle navigation or UI changes
        console.log('User signed in:', user);
      }
    });
    return subscriber; // Unsubscribe on unmount
  }, []);

  const handlePhoneNumberChange = (text) => {
    setPhoneNumber(text);
  };

  const handleCodeChange = (text) => {
    setCode(text);
  };

  const startPhoneNumberVerification = async () => {
    try {
      // Create a RecaptchaVerifier instance (replace with your site key)
      const recaptchaVerifier = new window.firebase.auth.RecaptchaVerifier('recaptcha-container', 'invisible', auth);

      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      setVerificationId(confirmationResult.verificationId);
    } catch (error) {
      console.error('Error starting phone number verification:', error);
    }
  };

  const verifyCode = async () => {
    try {
      const credential = await ConfirmationResult.credential(verificationId, code);
      await auth.signInWithCredential(credential);
      console.log('Code verified successfully');
    } catch (error) {
      console.error('Error verifying code:', error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TextInput
        placeholder="Enter phone number"
        value={phoneNumber}
        onChangeText={handlePhoneNumberChange}
      />
      <Button title="Start Verification" onPress={startPhoneNumberVerification} />
      {verificationId && (
        <>
          <TextInput
            placeholder="Enter verification code"
            value={code}
            onChangeText={handleCodeChange}
          />
          <Button title="Verify Code" onPress={verifyCode} />
        </>
      )}
    </View>
  );
};

export default PhoneAuth;