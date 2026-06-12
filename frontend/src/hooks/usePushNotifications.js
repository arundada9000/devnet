import { useState, useEffect, useCallback, useRef } from "react";
import API from "../api/axios";

const PUSH_OPT_OUT_KEY = "sajilo-push-opted-out";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}

export default function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const autoSubAttempted = useRef(false);

  const doSubscribe = useCallback(async () => {
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        return false;
      }

      const { data } = await API.get("/push/vapid-public-key");
      const vapidKey = data.publicKey;

      if (!vapidKey) {
        console.warn("[Push] No VAPID key available.");
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      await API.post("/push/subscribe", subscription.toJSON());
      setIsSubscribed(true);
      return true;
    } catch (err) {
      console.error("[Push] Subscribe failed:", err);
      return false;
    }
  }, []);

  useEffect(() => {
    const supported = "serviceWorker" in navigator && "PushManager" in window;
    setIsSupported(supported);
    if (!supported) return;

    setPermission(Notification.permission);

    const init = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const existingSub = await registration.pushManager.getSubscription();

        if (existingSub) {
          setIsSubscribed(true);
          return;
        }

        const optedOut = localStorage.getItem(PUSH_OPT_OUT_KEY) === "true";

        if (
          !optedOut &&
          !autoSubAttempted.current &&
          Notification.permission !== "denied"
        ) {
          autoSubAttempted.current = true;
          setLoading(true);
          await doSubscribe();
          setLoading(false);
        }
      } catch {
      }
    };

    init();
  }, [doSubscribe]);

  const subscribe = useCallback(async () => {
    setLoading(true);
    const success = await doSubscribe();
    if (success) {
      localStorage.removeItem(PUSH_OPT_OUT_KEY);
    }
    setLoading(false);
    return success;
  }, [doSubscribe]);

  const unsubscribe = useCallback(async () => {
    setLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await API.post("/push/unsubscribe", { endpoint: subscription.endpoint });
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      localStorage.setItem(PUSH_OPT_OUT_KEY, "true");
      setLoading(false);
      return true;
    } catch (err) {
      console.error("[Push] Unsubscribe failed:", err);
      setLoading(false);
      return false;
    }
  }, []);

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    subscribe,
    unsubscribe,
  };
}
