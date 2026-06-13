import React, { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useLocalGovernment } from "./hooks/useLocalGovernment";
import usePushNotifications from "./hooks/usePushNotifications";
import useSWUpdate from "./hooks/useSWUpdate";
import UpdateBanner from "./components/UpdateBanner";
import useAuth from "./stores/useAuth";

const App = () => {
  useEffect(() => {
    useAuth.getState().autoLogin();
  }, []);
  useLocalGovernment();
  usePushNotifications();
  const { updateReady, applyUpdate } = useSWUpdate();
  return (
    <>
      <UpdateBanner visible={updateReady} onUpdate={applyUpdate} />
      <AppRoutes />
    </>
  );
};

export default App;

