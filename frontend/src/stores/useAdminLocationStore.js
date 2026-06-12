import { create } from "zustand";
import { useLocalGovStore } from "./localGovStore";
import API from "../api/axios";

const useAdminLocationStore = create((set, get) => ({
  adminLocation: "",
  availableLocations: [],
  loaded: false,

  init: async () => {
    if (get().loaded) return;

    const cachedGov = useLocalGovStore.getState().localGov;
    if (cachedGov) {
      set({ adminLocation: cachedGov });
    }

    try {
      const res = await API.get("/location/available");
      const locations = Array.isArray(res.data) ? res.data : [];
      set({ availableLocations: locations, loaded: true });

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
