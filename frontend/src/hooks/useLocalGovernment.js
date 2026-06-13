// Local government boundary detection using backend API
import { useEffect, useState } from "react";
import { useLocalGovStore } from "../stores/localGovStore";

export const useLocalGovernment = () => {
  const [loading, setLoading] = useState(true);
  const { getLocalGov, setLocalGov } = useLocalGovStore();
  const [localGov, setLocalGovState] = useState(getLocalGov());

  useEffect(() => {
    const detectLocalGov = async () => {
      // Use cached value if available
      const cached = getLocalGov();
      if (cached) {
        setLocalGovState(cached);
        setLoading(false);
        return;
      }

      try {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
              const res = await fetch(`${apiUrl}/location/detect?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`);
              if (!res.ok) throw new Error("API failed");
              const data = await res.json();
              const name = data.localGovName || "Unknown";
              const coords = [pos.coords.latitude, pos.coords.longitude];

              // Cache result in Zustand
              setLocalGov(name, coords);
              setLocalGovState(name);
            } catch (err) {
              console.error("Backend detection failed", err);
              setLocalGov("Detection Failed", null);
              setLocalGovState("Detection Failed");
            } finally {
              setLoading(false);
            }
          },
          (err) => {
            console.error("Geolocation Error", err.message);
            setLocalGov("Location Access Denied");
            setLocalGovState("Location Access Denied");
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Geolocation request failed", err);
        setLocalGov("Detection Failed");
        setLocalGovState("Detection Failed");
        setLoading(false);
      }
    };

    detectLocalGov();
  }, []);

  return { localGov, loading };
};

