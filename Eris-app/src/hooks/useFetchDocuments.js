import { useState, useEffect } from "react";
import { ref, onValue, off } from "firebase/database";
import { database } from "../services/firebaseConfig";
import useCurrentUser from "./useCurrentUser";

const useFetchDocuments = () => {
  const { currentUser } = useCurrentUser();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe = null; // Variable to store the listener cleanup function

    const fetchDocuments = () => {
      try {
        const documentsRef = ref(database, "requestClearance");

        unsubscribe = onValue(documentsRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = [];
            snapshot.forEach((doc) => {
              const docData = doc.val();
              if (docData.customUserId === currentUser?.customId) {
                data.push({ ...docData, id: doc.key });
              }
            });
            setDocuments(data);
          } else {
            setDocuments([]);
          }
          setLoading(false);
        });
      } catch (e) {
        setError(e);
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchDocuments();
    }

    // Cleanup the listener when the component unmounts or `currentUser` changes
    return () => {
      if (unsubscribe) {
        off(ref(database, "requestClearance"));
      }
    };
  }, [currentUser]);

  return { documents, loading, error };
};

export default useFetchDocuments;
