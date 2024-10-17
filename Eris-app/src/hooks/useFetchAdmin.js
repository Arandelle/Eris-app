import { useEffect, useState } from "react"
import { ref, onValue} from "firebase/database";
import { database } from "../services/firebaseConfig";


const useFetchAdmin = () => {

    const [adminData, setAdminData] = useState([]);

    useEffect(() => {
        const adminRef = ref(database, `admins`);
        const unsubscribe = onValue(adminRef, (snapshot) => {
            if(snapshot.exist()) {
                    const adminData = snapshot.val();
                    const adminList = Object.keys(adminData).map((key) => ({
                        id: key,
                        ...adminData[key]
                    }));
                    setAdminData(adminList);
            } else{
                setAdminData([])
            }
        });

        return () => unsubscribe();
    })

  return {adminData};
}

export default useFetchAdmin
