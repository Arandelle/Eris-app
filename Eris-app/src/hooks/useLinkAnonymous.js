import { 
    EmailAuthProvider,
    linkWithCredential,
    sendEmailVerification,
  } from "firebase/auth";
import { Alert } from "react-native";

  export const linkAnonymousAccount = async (auth, email, password) => {
    if (!auth.currentUser?.isAnonymous) {
      return {
        success: false,
        error: "Current user is not anonymous or not logged in"
      };
    }
  
    try {
      // Validate email and password
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
  
      if (password.length < 6) {
        throw new Error("Password should be at least 6 characters");
      }
  
      // Create email/password credential
      const credential = EmailAuthProvider.credential(email, password);
  
      // Link anonymous account with credential
      const result = await linkWithCredential(auth.currentUser, credential);
  
      // Send verification email
      await sendEmailVerification(result.user);
  
      return {
        success: true,
        user: result.user
      };
  
    } catch (error) {
      let errorMessage = "Failed to link account";
  
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "This email is already registered. Please sign in with this email instead.";
          break;
        case 'auth/invalid-email':
          errorMessage = "The email address is not valid.";
          break;
        case 'auth/operation-not-allowed':
          errorMessage = "Email/password accounts are not enabled. Please enable them in the Firebase Console.";
          break;
        case 'auth/weak-password':
          errorMessage = "The password is too weak. It should be at least 6 characters long.";
          break;
        default:
          errorMessage = error.message;
      }
  
      return {
        success: false,
        error: errorMessage
      };
    }
  };
  
  // Usage example
  export const handleAccountLinking = async (auth, email, password) => {
    const result = await linkAnonymousAccount(auth, email, password);
    
    if (result.success) {
      console.log("Account successfully linked!", result.user);
      // Handle successful linking (e.g., redirect to profile page)
      return true;
    } else {
      console.error("Error linking account:", result.error);
      Alert.alert("Error Linking account",result.error)
      // Handle error (e.g., show error message to user)
      return false;
    }
  };