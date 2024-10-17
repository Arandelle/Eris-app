import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { auth, database } from "../services/firebaseConfig";
import { ref, update } from "firebase/database";
import useResponderData from "./useResponderData";

const useLocationTracking = (userData, setRefreshing) => {
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [geoCodeLocation, setGeoCodeLocation] = useState("");
  const [responderLocation, setResponderLocation] = useState(null);
  const { responderData } = useResponderData();  // Fetch responder data dynamically

  // Function to update user's location in Firebase
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

  // Function to track user location
  const trackUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocation("Permission denied. Using fallback location.");
        setLatitude(14.33289);
        setLongitude(120.85065);
        return;
      }

      // Watch user location
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

          // Reverse geocode to get the address
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
    setRefreshing(false);
  };

  // Effect to track responder location based on active request
  useEffect(() => {
    // Get responder's ID from the user's active request
    const responderId = userData?.activeRequest?.responderId;
    if (responderId) {
      const locationOfResponder = responderData.find(
        (responder) => responder.id === responderId
      );

      if (locationOfResponder && locationOfResponder.location) {
        const { latitude, longitude } = locationOfResponder.location;
        setResponderLocation({ latitude, longitude });
      }
    }
    
    // Track user location
    trackUserLocation();

    // Cleanup function to avoid memory leaks
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [userData, responderData]);

  return {
    location,
    latitude,
    longitude,
    geoCodeLocation,
    responderLocation,  // Responder's location dynamically updated
    trackUserLocation,
  };
};

export default useLocationTracking;
