// src/stores/useRegistration.js
import { create } from "zustand";

const useRegistration = create((set) => ({
  stepData: null,
  setStepData: (data) => set({ stepData: data }),
  clearStepData: () => set({ stepData: null }),
}));

export default useRegistration;
