import React, {useState,useEffect} from 'react'
import {ref, get} from "firebase/database"
import {auth, database} from "../services/firebaseConfig"

export const useFetchData = () => {
    const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setUserData(snapshot.val());
        } else {
          console.log("No user data available");
        }
      }
    };

    fetchUserData();
  }, []);

  return {userData, setUserData};
}
