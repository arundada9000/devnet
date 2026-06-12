import { Request, Response } from "express";
import PushSubscription from "../models/pushSubscriptionModel";
import { env } from "../env";

export const subscribe = async (req: Request, res: Response) => {
  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      res.status(400).json({ message: "Invalid subscription object." });
      return;
    }

    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { endpoint, keys, userId: req.body.userId || null },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: "Subscription saved." });
  } catch (err) {
    console.error("Push subscribe error:", err);
    res.status(500).json({ message: "Failed to save subscription.", error: err });
  }
};

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

export const getVapidPublicKey = (_: Request, res: Response) => {
  const key = env.VAPID_PUBLIC_KEY;
  if (!key) {
    res.status(500).json({ message: "VAPID public key not configured." });
    return;
  }
  res.json({ publicKey: key });
};

export const sendPushToAll = async (title: string, body: string, url?: string) => {
  let webpush: any;
  try {
    webpush = require("web-push");
  } catch {
    console.warn("[Push] web-push not installed, skipping push notifications.");
    return;
  }

  const vapidPublic = env.VAPID_PUBLIC_KEY;
  const vapidPrivate = env.VAPID_PRIVATE_KEY;
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
      if (err.statusCode === 410 || err.statusCode === 404) {
        await PushSubscription.deleteOne({ _id: sub._id });
      }
      failed++;
    }
  }

  console.log(`[Push] Sent: ${sent}, Failed: ${failed}, Total: ${subscriptions.length}`);
};
