import { Router } from "express";
import twilio from "twilio";
import { handleIncomingSms, replyToSmsReport } from "../controllers/smsController";
import authenticateToken from "../middlewares/authenticateToken";
import requireAdmin from "../middlewares/requireAdmin";

const router = Router();

router.post("/sms", twilio.webhook({ validate: process.env.NODE_ENV === "production" }), handleIncomingSms);
router.post("/sms/reply", authenticateToken, requireAdmin, replyToSmsReport);

export default router;
