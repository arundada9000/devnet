import { create } from "zustand";
import API from "../api/axios";

const useAuth = create((set, get) => ({
  user: null,
  token: null,
  isCheckingAuth: true,

  login: (user, token) => {
    localStorage.setItem("token", token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
  updateUser: (newData) => {
    const current = useAuth.getState().user;
    if (current) {
      set({ user: { ...current, ...newData } });
    }
  },
  isAuthenticated: () => !!useAuth.getState().user,
  autoLogin: async () => {
    if (get()._autoLoginPromise) return get()._autoLoginPromise;

    const promise = (async () => {
      try {
        const verifyRes = await API.get("/auth/verify", {
          withCredentials: true,
        });
        const fullUser = verifyRes.data.user;
        set({ user: fullUser, isCheckingAuth: false });
      } catch (err) {
        set({ user: null, isCheckingAuth: false });
      } finally {
        set({ _autoLoginPromise: null });
      }
    })();

    set({ _autoLoginPromise: promise });
    return promise;
  },
}));

export default useAuth;
