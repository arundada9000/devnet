import { Router } from "express";
import { subscribe, unsubscribe, getVapidPublicKey, broadcastPush } from "../controllers/pushController";
import authenticateToken from "../middlewares/authenticateToken";
import requireAdmin from "../middlewares/requireAdmin";

const router = Router();

// Public: get VAPID key for subscription
router.get("/vapid-public-key", getVapidPublicKey);

// Subscribe/unsubscribe (no auth required — anonymous subscriptions)
router.post("/subscribe", subscribe);
router.post("/unsubscribe", unsubscribe);

// Admin: Broadcast push to selected users
router.post("/broadcast", authenticateToken, requireAdmin, broadcastPush);

export default router;
