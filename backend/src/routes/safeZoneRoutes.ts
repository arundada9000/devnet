import { Router } from "express";
import {
  getAllSafeZones,
  createSafeZone,
  updateSafeZone,
  deleteSafeZone,
} from "../controllers/safeZoneController";
import authenticateToken from "../middlewares/authenticateToken";

const router = Router();

// Public: get all active safe zones
router.get("/", getAllSafeZones);

// Admin only: mutations
router.post("/", authenticateToken, createSafeZone);
router.put("/:id", authenticateToken, updateSafeZone);
router.delete("/:id", authenticateToken, deleteSafeZone);

export default router;
