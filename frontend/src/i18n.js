import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "./locales/en/translation.json";

const localeModules = import.meta.glob("./locales/*/translation.json");

const localeMap = {};
for (const path in localeModules) {
  const match = path.match(/\.\/locales\/([^/]+)\/translation\.json$/);
  if (match) {
    localeMap[match[1]] = localeModules[path];
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translationEN },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export const loadLanguage = async (lang) => {
  if (i18n.hasResourceBundle(lang, "translation")) return;
  if (!localeMap[lang]) {
    console.warn(`[i18n] No locale found for: ${lang}`);
    return;
  }
  try {
    const module = await localeMap[lang]();
    i18n.addResourceBundle(lang, "translation", module.default || module);
  } catch (err) {
    console.warn(`[i18n] Failed to load language: ${lang}`, err);
  }
};

export default i18n;
