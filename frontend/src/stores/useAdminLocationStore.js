import { create } from "zustand";
import { useLocalGovStore } from "./localGovStore";
import API from "../api/axios";

/**
 * Stores the admin's working location (ga-pa) and the list of all
 * available locations fetched from the backend.
 *
 * On first load it seeds `adminLocation` from the user-side
 * `localGovStore` so the admin immediately sees data for their area.
 */
const useAdminLocationStore = create((set, get) => ({
  adminLocation: "",
  availableLocations: [],
  loaded: false,

  /** Call once on admin layout mount */
  init: async () => {
    if (get().loaded) return;

    // 1. Seed from user-side cached location
    const cachedGov = useLocalGovStore.getState().localGov;
    if (cachedGov) {
      set({ adminLocation: cachedGov });
    }

    // 2. Fetch all available locations from backend
    try {
      const res = await API.get("/location/available");
      const locations = Array.isArray(res.data) ? res.data : [];
      set({ availableLocations: locations, loaded: true });

      // If we didn't have a cached location, default to the first available
      if (!cachedGov && locations.length > 0) {
        set({ adminLocation: locations[0] });
      }
    } catch (err) {
      console.error("Failed to fetch available locations:", err);
      set({ loaded: true });
    }
  },

  setAdminLocation: (location) => set({ adminLocation: location }),
}));

export default useAdminLocationStore;
