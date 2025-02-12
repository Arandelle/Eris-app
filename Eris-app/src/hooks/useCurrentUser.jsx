import useFetchData from './useFetchData'
import { auth, database } from '../services/firebaseConfig';
import {ref, update} from "firebase/database"
import { useContext, useEffect } from 'react';
import { OfflineContext } from '../context/OfflineContext';

const useCurrentUser = () => {
    const {saveStoredData} = useContext(OfflineContext);
    const {data: userData} = useFetchData("users");
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
    };

    // save current user to AsyncStorage everytime current user updates
    useEffect(() => {
        if(currentUser){
            saveStoredData("currentUser", currentUser);
        }
    }, [currentUser]);

  return {currentUser, updateCurrentUser, userInfo}
}

export default useCurrentUser
