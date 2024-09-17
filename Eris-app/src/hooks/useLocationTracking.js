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
                  const { name, city, region, country } = reverseGeocode[0];
                  const locString = `${name ? name : ''} - ${city}, ${region}, ${country}`;
                  setLocation(locString.trim());
                }  else {
                  setLocation("Location not found");
                  setLatitude(14.33289);
                  setLongitude(120.85065);
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
