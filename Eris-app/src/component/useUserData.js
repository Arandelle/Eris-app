// // useUserData.js
// import { useState, useEffect } from "react";
// import { ref, onValue } from "firebase/database";
// import { auth, database } from "./firebaseConfig"; // Adjust path as needed
// import { onAuthStateChanged } from "firebase/auth";
// import { useNavigation } from "@react-navigation/native";

// const useUserData = () => {
//   const navigation = useNavigation();
//   const [userData, setUserData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         const userRef = ref(database, `users/${user.uid}`);

//         try {
//           const snapshot = await new Promise((resolve, reject) => {
//             onValue(userRef, resolve, reject, { onlyOnce: true });
//           });
//           const data = snapshot.val();
//           setUserData(data);
//           setLoading(false); // Set loading to false after data is fetched
//         } catch (error) {
//           console.error("Error fetching user data:", error);
//           Alert.alert("Error", "Failed to fetch user data. Please try again.");
//         }
//       } else {
//         navigation.navigate("Login"); // Redirect to Login if not authenticated
//       }
//     });

//     return () => unsubscribeAuth();
//   }, []);

//   return { userData, loading };
// };

// export default useUserData;
