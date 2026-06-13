import { useState, useEffect, useCallback, useRef } from "react";
import API from "../api/axios";

const PUSH_OPT_OUT_KEY = "sajilo-push-opted-out";

/**
 * Convert a VAPID public key from URL-safe base64 to Uint8Array.
 */
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}

/**
 * React hook for managing Web Push Notification subscription.
 *
 * By default, auto-subscribes users on first visit (if permission is not denied
 * and the user hasn't explicitly opted out). Users can unsubscribe from
 * the Profile page, which sets an opt-out flag in localStorage.
 */
export default function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const autoSubAttempted = useRef(false);

  // ── Core subscribe logic (reusable) ──
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

  // ── Check existing subscription & auto-subscribe ──
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
          // Already subscribed in the browser — re-register with backend
          // to ensure userId is linked (it may have been null before)
          setIsSubscribed(true);
          try {
            await API.post("/push/subscribe", existingSub.toJSON());
          } catch {
            // Non-critical: subscription already exists, just couldn't update userId
          }
          return;
        }

        // Not subscribed yet — auto-subscribe unless user opted out
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
        // Silently fail
      }
    };

    init();
  }, [doSubscribe]);

  // ── Manual subscribe (user re-enables from Profile) ──
  const subscribe = useCallback(async () => {
    setLoading(true);
    const success = await doSubscribe();
    if (success) {
      // Clear the opt-out flag since user explicitly re-enabled
      localStorage.removeItem(PUSH_OPT_OUT_KEY);
    }
    setLoading(false);
    return success;
  }, [doSubscribe]);

  // ── Unsubscribe (user opts out) ──
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
      // Mark as opted-out so auto-subscribe doesn't re-trigger
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
