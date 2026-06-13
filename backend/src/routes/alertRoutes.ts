import { Router } from "express";
import {
  createAlert,
  getAllAlerts,
  updateAlert,
  deleteAlert,
} from "../controllers/alertController";
import authenticateToken from "../middlewares/authenticateToken";

const router = Router();
router.get("/", getAllAlerts);

// All routes require authentication
router.use(authenticateToken);
router.post("/", createAlert);
router.put("/:id", updateAlert);
router.delete("/:id", deleteAlert);

export default router;
