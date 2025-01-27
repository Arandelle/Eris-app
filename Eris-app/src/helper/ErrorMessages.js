import { Alert } from 'react-native';

const ErrorMessages = (error) => {
  switch (error.code) {
    // Authentication Errors
    case "auth/invalid-credential":
      Alert.alert("An error occured","Invalid credential. Please try again.");
      break;
    case "auth/user-disabled":
      Alert.alert("An error occured","This user account has been disabled.");
      break;
    case "auth/user-not-found":
      Alert.alert("An error occured","No user found with this email.");
      break;
    case "auth/wrong-password":
      Alert.alert("An error occured","Invalid password. Please try again.");
      break;
    case "auth/too-many-requests":
      Alert.alert("An error occured","Too many unsuccessful attempts. Please try again later.");
      break;
    case "auth/email-already-in-use":
      Alert.alert("An error occured","Email is already in use. Please use another email.");
      break;
    case "auth/weak-password":
      Alert.alert("An error occured","Password is too weak. Please use a stronger password.");
      break;
    case "auth/invalid-email":
      Alert.alert("An error occured","Invalid email format. Please enter a valid email.");
      break;

    // Registration Errors
    case "auth/missing-email":
      Alert.alert("An error occured","Email is required for this operation.");
      break;

    // Token Errors
    case "auth/id-token-expired":
      Alert.alert("An error occured","Your session has expired. Please log in again.");
      break;
    case "auth/id-token-revoked":
      Alert.alert("An error occured","Your session has been revoked. Please log in again.");
      break;

    // Credential Errors
    case "auth/invalid-verification-code":
      Alert.alert("An error occured","Invalid verification code. Please check and try again.");
      break;
    case "auth/invalid-verification-id":
      Alert.alert("An error occured","Invalid verification ID. Please try again.");
      break;

    // Operation Errors
    case "auth/operation-not-allowed":
      Alert.alert("An error occured","This operation is not allowed. Contact support.");
      break;

    // Network Errors
    case "auth/network-request-failed":
      Alert.alert("An error occured","Network error. Please check your internet connection.");
      break;

    // Recaptcha Errors
    case "auth/captcha-check-failed":
      Alert.alert("An error occured","Recaptcha verification failed. Please try again.");
      break;
    case "auth/recaptcha-not-supported":
      Alert.alert("An error occured","Recaptcha is not supported in this environment.");
      break;

    // Other Errors
    case "auth/requires-recent-login":
      Alert.alert("An error occured","Please log in again to proceed.");
      break;
    case "auth/unverified-email":
      Alert.alert("An error occured","Please verify your email before logging in.");
      break;

    default:
      Alert.alert("An error occured",`An error occurred: ${error.message}`);
      break;
  }
}

export default ErrorMessages;
