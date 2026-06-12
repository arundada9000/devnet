import { Router } from "express";
import { subscribe, unsubscribe, getVapidPublicKey } from "../controllers/pushController";

const router = Router();

router.get("/vapid-public-key", getVapidPublicKey);
router.post("/subscribe", subscribe);
router.post("/unsubscribe", unsubscribe);

export default router;
