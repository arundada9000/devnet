import { useState, useEffect, useCallback, useRef } from "react";

export default function useSWUpdate() {
  const [updateReady, setUpdateReady] = useState(false);
  const waitingWorkerRef = useRef(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      const registration = await navigator.serviceWorker.register("/sw.js");

      if (registration.waiting) {
        waitingWorkerRef.current = registration.waiting;
        setUpdateReady(true);
        return;
      }

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            waitingWorkerRef.current = newWorker;
            setUpdateReady(true);
          }
        });
      });
    };

    register();
  }, []);

  useEffect(() => {
    const handler = () => window.location.reload();
    navigator.serviceWorker?.addEventListener("controllerchange", handler);
    return () =>
      navigator.serviceWorker?.removeEventListener("controllerchange", handler);
  }, []);

  const applyUpdate = useCallback(() => {
    if (!waitingWorkerRef.current) return;
    waitingWorkerRef.current.postMessage({ type: "SKIP_WAITING" });
  }, []);

  return { updateReady, applyUpdate };
}
