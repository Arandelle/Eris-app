import { useState, useEffect } from "react"
import * as Location from "expo-location";

const useLocationTracking = () => {

    const [location, setLocation] = useState("");
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);

    useEffect(() => {
        let locationSubscription;
    
        (async () => {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Permission to access location denied");
            return;
          }
    
          locationSubscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 10000,
              distanceInterval: 10,
            },
            async (location) => {
              try {
                const { latitude, longitude } = location.coords;
    
                // Update the latitude and longitude states
                setLatitude(latitude);
                setLongitude(longitude);
    
                // Reverse geocoding to get the address
                const reverseGeocode = await Location.reverseGeocodeAsync({
                  latitude,
                  longitude,
                });
    
                if (reverseGeocode.length > 0) {
                  const { name, city, region } = reverseGeocode[0];
                  const locString = `${name} - ${city}, ${region}`;
                  setLocation(locString);
                } else {
                  setLocation("Location not found");
                }
              } catch (error) {
                console.error(error);
                setLocation("Error retrieving location");
              }
            }
          );
        })();
    
        return () => {
          if (locationSubscription) {
            locationSubscription.remove();
          }
        };
      }, []);


  return {location,setLocation, latitude, longitude};
}

export default useLocationTracking
