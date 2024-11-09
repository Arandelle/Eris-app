import { OPENROUTE_API_KEY } from "@env";
import { useState, useEffect } from "react";

const openRouteKey = OPENROUTE_API_KEY;

const useRoute = (responderPosition, latitude, longitude) => {

  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(0);

  const fetchRoute = async () => {
    if (!responderPosition || !latitude || !longitude) return;

    try {
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${openRouteKey}&start=${responderPosition.longitude},${responderPosition.latitude}&end=${longitude},${latitude}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const coordinates = data.features[0].geometry.coordinates;
        const formattedRoute = coordinates.map((coord) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));
        setRoute(formattedRoute);
        setDistance(data.features[0].properties.summary.distance / 1000);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  useEffect(() => {
      fetchRoute();
  }, [responderPosition, latitude, longitude]);

  return {route,setRoute, distance,setDistance}
};

export default useRoute;
