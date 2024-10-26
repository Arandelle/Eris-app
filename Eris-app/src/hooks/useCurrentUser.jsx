import useResponderData from './useFetchData'
import { auth, database } from '../services/firebaseConfig';
import {ref} from "firebase/database"

const useCurrentUser = () => {

    const {data: userData} = useResponderData("users");
    const userInfo = auth.currentUser;
    const currentUser = userData.find((user) => user.id === userInfo?.uid) || null;

    const updateCurrentUser = async (updatedData) => {
        if(userInfo?.uid){
            const userRef = ref(database, `users/${userInfo?.uid}`);

            try{
                await update(userRef, updatedData);
                console.log("User data updated successfully!")
            } catch(error){
                console.error("Error updating: ", error)
            }
        }
    }

  return {currentUser, updateCurrentUser}
}

export default useCurrentUser
