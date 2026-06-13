// Local government boundary detection using backend API
import { useEffect, useState } from "react";
import { useLocalGovStore } from "../stores/localGovStore";
import { prefetchLocalContacts } from "../utils/offlineQueue";
import API from "../api/axios";

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
        prefetchLocalContacts(API, cached);
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
              
              // Prefetch offline contacts for this specific local gov
              if (name !== "Unknown") {
                prefetchLocalContacts(API, name);
              }
            } catch (err) {
              console.error("Backend detection failed", err);
              // Save coordinates even if backend fails (we are offline)
              const coords = [pos.coords.latitude, pos.coords.longitude];
              setLocalGov("Unknown", coords);
              setLocalGovState("Unknown");
            } finally {
              setLoading(false);
            }
          },
          (err) => {
            console.error("Geolocation Error", err.message);
            setLocalGov("Location Access Denied");
            setLocalGovState("Location Access Denied");
            setLoading(false);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
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

