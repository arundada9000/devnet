import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./i18n";
import { loadLanguage } from "./i18n";
import usePreferences from "./stores/UsePreference.jsx";
import { useTranslation } from "react-i18next";

const ApplyPreferences = ({ children }) => {
  const { theme, fontSize, fontFamily, language, loadPreferences } =
    usePreferences();
  const { i18n } = useTranslation();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    loadPreferences();
    setReady(true);
  }, []);

  React.useEffect(() => {
    if (!ready) return;

    const body = document.body;

    body.classList.remove("theme-light", "theme-dark");
    body.classList.add(`theme-${theme}`);

    body.classList.remove(
      "font-poppins",
      "font-arial",
      "font-sans",
      "font-serif",
      "font-mono",
      "font-montserrat",
      "font-roboto",
      "font-inter",
      "font-outfit",
      "font-mukta",
      "font-yantramanav",
      "font-khand",
      "font-kalam",
      "font-laila"
    );
    body.classList.add(`font-${fontFamily}`);

    body.classList.remove("text-sm", "text-base", "text-lg", "text-xl");
    body.classList.add(`text-${fontSize}`);

    loadLanguage(language).then(() => i18n.changeLanguage(language));
  }, [theme, fontSize, fontFamily, language, ready]);

  if (!ready) return null;

  return <>{children}</>;
};

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const Root = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ApplyPreferences>
          <App />
        </ApplyPreferences>
      </HelmetProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
