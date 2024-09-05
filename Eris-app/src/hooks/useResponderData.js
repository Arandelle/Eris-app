import { useEffect, useState } from "react"
import {ref, onValue} from "firebase/database"
import { database } from "../services/firebaseConfig";

const useResponderData = () => {

    const [responderData, setResponderData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        const responderRef = ref(database, `responders`);
        const unsubscribe = onValue(responderRef, (snapshot) => {
            if(snapshot.exists()){
                const responderData = snapshot.val();
                const responderList = Object.keys(responderData).map((key) =>({
                    id: key,
                    ...responderData[key],
                }));
                setResponderData(responderList);
            }else{
                setResponderData([])
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [])

  return {responderData, loading}
}

export default useResponderData
