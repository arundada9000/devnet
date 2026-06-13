import { create } from "zustand";

const useAuthStore = create((set) => ({
  // user: null,
  // token: null,
  user: {
    name: "Demo User",
    email: "demo@example.com",
    role: "Citizen",
    phone: "+977 9812345678",
    gender: "Male",
    city: "Butwal",
    address: "Rupandehi",
    citizenshipId: "21 0234 214",
  },
  token: "hardcoded-demo-token",
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  logout: () => set({ user: null, token: null }),
}));

export default useAuthStore;
