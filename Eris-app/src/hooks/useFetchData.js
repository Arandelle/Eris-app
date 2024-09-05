import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { auth, database } from '../services/firebaseConfig';

export const useFetchData = (datatype) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setUserData(null);
      setLoading(false);
      return; // Exit early if no user
    }

    const userRef = ref(database, `${datatype}/${user.uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserData(snapshot.val());
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    // Cleanup on unmount
    return () => unsubscribe();
  }, [datatype]);

  return { userData, loading, setUserData };
};
