import { create } from "zustand";

const defaultPrefs = {
  theme: "light",
  fontSize: "base",
  fontFamily: "sans",
  language: "en",
};

const usePreferences = create((set) => ({
  ...defaultPrefs,

  setTheme: (theme) => {
    document.body.classList.remove("theme-light", "theme-dark");
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem("theme", theme);
    set({ theme });
  },

  setFontSize: (fontSize) => {
    localStorage.setItem("fontSize", fontSize);
    set({ fontSize });
  },

  setFontFamily: (fontFamily) => {
    localStorage.setItem("fontFamily", fontFamily);
    set({ fontFamily });
  },

  setLanguage: (language) => {
    localStorage.setItem("language", language);
    set({ language });
  },

  loadPreferences: () => {
    const theme = localStorage.getItem("theme") || "light";
    const fontSize = localStorage.getItem("fontSize") || "base";
    const fontFamily = localStorage.getItem("fontFamily") || "sans";
    const language = localStorage.getItem("language") || "en";

    document.body.classList.add(`theme-${theme}`);
    set({ theme, fontSize, fontFamily, language });
  },
}));

export default usePreferences;
