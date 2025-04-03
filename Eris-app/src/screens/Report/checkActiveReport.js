import React, { useContext, useEffect, useState } from 'react'
import useCurrentUser from '../../hooks/useCurrentUser';
import { OfflineContext } from '../../context/OfflineContext';

const checkActiveReport = (refreshing) => {

    const {currentUser} = useCurrentUser();
    const {isOffline, storedData} = useContext(OfflineContext);
    const [reportStatus, setReportStatus] = useState("");
     const [activeRequestId, setActiveRequestId] = useState("");

     // check emergency status
  useEffect(() => {
    const checkActiveRequest = async () => {
      try {
        if (currentUser?.activeRequest) {
          const {status, requestId} = currentUser.activeRequest;

          if(status === "pending" || status === "on-going" || status === "resolved"){
            setReportStatus(status);
            setActiveRequestId(requestId);
            return;
          }
        }
       if (isOffline && storedData?.activeRequestData) {

        const {status, tempRequestId} = storedData.activeRequestData;

        if(status === "pending" || status === "on-going"){
          setReportStatus(status);
          setActiveRequestId(tempRequestId);

          return;
        }
        } 
          setReportStatus("");
          setActiveRequestId("");
      } catch (error) {
        Alert.alert("Error", `${error}`);
      }
    };
    console.log("active request id:", activeRequestId);
    checkActiveRequest();
  }, [currentUser, isOffline, storedData, refreshing]);

  return {reportStatus, activeRequestId};
}

export default checkActiveReport;
