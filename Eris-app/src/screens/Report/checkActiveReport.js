import React, { useContext, useEffect, useState } from 'react'
import useCurrentUser from '../../hooks/useCurrentUser';
import { OfflineContext } from '../../context/OfflineContext';

const checkActiveReport = (refreshing) => {

    const {currentUser} = useCurrentUser();
    const {isOffline, storedData} = useContext(OfflineContext);
     const [hasActiveRequest, setHasActiveRequest] = useState(false);
     const [activeRequestId, setActiveRequestId] = useState("");

     // check emergency status
  useEffect(() => {
    const checkActiveRequest = async () => {
      try {
        if (currentUser?.activeRequest) {
          setHasActiveRequest(true);
          setActiveRequestId(currentUser?.activeRequest?.requestId);
        } else if (isOffline) {
          if (storedData.offlineRequest || storedData.activeRequestData) {
            const activeRequestData =
              storedData.offlineRequest || storedData.activeRequestData;
            setHasActiveRequest(true);
            setHasActiveRequest(activeRequestData.tempRequestId || "");
          }
        } else {
          setHasActiveRequest(false);
          setActiveRequestId("");
        }
      } catch (error) {
        Alert.alert("Error", `${error}`);
      }
    };
    console.log("active request id:", activeRequestId);
    checkActiveRequest();
  }, [currentUser, isOffline, storedData, refreshing]);

  return {hasActiveRequest, activeRequestId};
}

export default checkActiveReport
