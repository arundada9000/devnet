import { Request, Response } from "express";
import PushSubscription from "../models/pushSubscriptionModel";
import webpush from "web-push";
import jwt from "jsonwebtoken";

// Save a push subscription
export const subscribe = async (req: Request, res: Response) => {
  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      res.status(400).json({ message: "Invalid subscription object." });
      return;
    }

    // Try to get userId from body, or extract from JWT token if present
    let userId = req.body.userId || null;
    if (!userId) {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as any;
          userId = decoded.id || null;
        } catch {
          // Token invalid/expired — just proceed without userId
        }
      }
    }

    // Upsert: update if endpoint exists, create if not
    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { endpoint, keys, userId },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: "Subscription saved." });
  } catch (err) {
    console.error("Push subscribe error:", err);
    res.status(500).json({ message: "Failed to save subscription.", error: err });
  }
};

// Remove a push subscription
export const unsubscribe = async (req: Request, res: Response) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      res.status(400).json({ message: "Endpoint is required." });
      return;
    }

    await PushSubscription.deleteOne({ endpoint });
    res.json({ message: "Subscription removed." });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove subscription.", error: err });
  }
};

// Get VAPID public key
export const getVapidPublicKey = (_: Request, res: Response) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) {
    res.status(500).json({ message: "VAPID public key not configured." });
    return;
  }
  res.json({ publicKey: key });
};

/**
 * Send a push notification to all subscribers.
 * Called internally from alertController when a new alert is created.
 */
export const sendPushToAll = async (title: string, body: string, url?: string) => {
  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidEmail = process.env.VAPID_EMAIL || "mailto:admin@sajilo-sahayata.com";

  if (!vapidPublic || !vapidPrivate) {
    console.warn("[Push] VAPID keys not configured, skipping push.");
    return;
  }

  webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);

  const subscriptions = await PushSubscription.find();
  const payload = JSON.stringify({
    title,
    body,
    icon: "/logos/icon-192x192.png",
    badge: "/logos/icon-96x96.png",
    url: url || "/dashboard/home",
  });

  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        payload
      );
      sent++;
    } catch (err: any) {
      // If subscription expired (410 Gone), remove it
      if (err.statusCode === 410 || err.statusCode === 404) {
        await PushSubscription.deleteOne({ _id: sub._id });
      }
      failed++;
    }
  }

  console.log(`[Push] Sent: ${sent}, Failed: ${failed}, Total: ${subscriptions.length}`);
};

export const sendPushToUsers = async (userIds: string[], title: string, body: string, url?: string) => {
  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidEmail = process.env.VAPID_EMAIL || "mailto:admin@sajilo-sahayata.com";

  if (!vapidPublic || !vapidPrivate) {
    console.warn("[Push] VAPID keys not configured, skipping push.");
    return;
  }

  webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);

  const subscriptions = await PushSubscription.find({ userId: { $in: userIds } });
  const payload = JSON.stringify({
    title,
    body,
    icon: "/logos/icon-192x192.png",
    badge: "/logos/icon-96x96.png",
    url: url || "/dashboard/home",
  });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        payload
      );
    } catch (err: any) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        await PushSubscription.deleteOne({ _id: sub._id });
      }
    }
  }
};

export const broadcastPush = async (req: Request, res: Response) => {
  try {
    const { userIds, message } = req.body;
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !message) {
      res.status(400).json({ message: "userIds array and message are required." });
      return;
    }

    await sendPushToUsers(userIds, "Admin Broadcast Alert", message, "/dashboard/home");
    res.status(200).json({ message: `Broadcast sent to ${userIds.length} volunteers successfully.` });
  } catch (error: any) {
    console.error("Failed to broadcast push:", error);
    res.status(500).json({ message: "Failed to broadcast push notification", error: error.message });
  }
};
