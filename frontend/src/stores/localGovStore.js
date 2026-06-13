import { create } from "zustand";

const EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes in ms

export const useLocalGovStore = create((set, get) => ({
  localGov: null,
  coordinates: null,
  lastUpdated: null,

  setLocalGov: (localGov, coordinates = null) =>
    set({
      localGov,
      coordinates,
      lastUpdated: Date.now(),
    }),

  getLocalGov: () => {
    const { localGov, lastUpdated } = get();
    if (!localGov || !lastUpdated) return null;

    const now = Date.now();
    if (now - lastUpdated > EXPIRY_TIME) {
      // Expired → clear cache
      set({ localGov: null, coordinates: null, lastUpdated: null });
      return null;
    }
    return localGov;
  },

  getCoordinates: () => {
    const { coordinates, lastUpdated } = get();
    if (!coordinates || !lastUpdated) return null;

    const now = Date.now();
    if (now - lastUpdated > EXPIRY_TIME) {
      return null;
    }
    return coordinates;
  },

  clearLocalGov: () => set({ localGov: null, coordinates: null, lastUpdated: null }),
}));
