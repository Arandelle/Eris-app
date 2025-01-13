import { useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { database } from "../services/firebaseConfig";
import useCurrentUser from "./useCurrentUser";

const useFetchDocuments = () => {
  const {currentUser} = useCurrentUser();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const documentsRef = ref(database, "requestClearance");
        const snapshot = await get(documentsRef);
        if (snapshot.exists()) {
          const data = [];
          snapshot.forEach((doc) => {
            const docData = doc.val();
            if (docData.userId === currentUser?.customId) {
              data.push({ ...docData, id: doc.key });
            }
          });
          setDocuments(data);
        } else {
          setDocuments([]);
        }
        setLoading(false);
      } catch (e) {
        setError(e);
        setLoading(false);
      }
    };
    if (currentUser) {
      fetchDocuments();
    }
  }, [currentUser]);

  return { documents, loading, error };
};

export default useFetchDocuments;
