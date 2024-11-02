import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { auth, database } from "../services/firebaseConfig";
import { ref, update, onValue } from "firebase/database";

const useLocationTracking = (userData, setRefreshing) => {
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [geoCodeLocation, setGeoCodeLocation] = useState("");
  const [responderLocation, setResponderLocation] = useState(null);

  const updateLocationInFirebase = async (lat, long, address) => {
    const user = auth.currentUser;
    const userLocationRef = ref(database, `users/${user.uid}/location`);
    try {
      await update(userLocationRef, {
        latitude: lat,
        longitude: long,
        address: address || "Location not available",
      });
      console.log("Location updated in Firebase");
    } catch (error) {
      console.error("Failed to update location in Firebase: ", error);
    }
  };
  
  const trackUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocation("Permission denied. Using fallback location.");
        setLatitude(14.33289);
        setLongitude(120.85065);
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 10,
        },
        async (location) => {
          const { latitude, longitude } = location.coords;
          setLatitude(latitude);
          setLongitude(longitude);

          // Reverse geocoding to get the address
          const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });

          if (reverseGeocode.length > 0) {
            const { name, city, region, country } = reverseGeocode[0];
            const locString = `${name ? name : ""} - ${city}, ${region}, ${country}`;
            setLocation(locString.trim());
            setGeoCodeLocation(locString.trim());

            // Update Firebase with geocoded location
            if (userData) {
              await updateLocationInFirebase(latitude, longitude, locString.trim());
            }
          } else {
            setLocation("Location not found");
          }
        }
      );
    } catch (error) {
      console.error("Error retrieving location: ", error);
      setLocation("Error retrieving location");
    }
    setRefreshing(false)
  };

  useEffect(() => {
    let locationSubscription;

    const fetchResponderLocation = () => {
      const user = auth.currentUser;
      const activeRequestRef = ref(database, `users/${user.uid}/activeRequest`);

      const unsubscribe = onValue(activeRequestRef, (snapshot) => {
        const activeRequestData = snapshot.val();
        if (activeRequestData && activeRequestData.locationOfResponder) {
          setResponderLocation({
            latitude: activeRequestData.locationOfResponder.latitude,
            longitude: activeRequestData.locationOfResponder.longitude,
          });
        }
      });

      return unsubscribe;
    };

    trackUserLocation();
    const unsubscribeResponder = fetchResponderLocation();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
      unsubscribeResponder();
    };
  }, [userData]);

  return { location, latitude, longitude, geoCodeLocation, responderLocation, trackUserLocation};
};

export default useLocationTracking;
