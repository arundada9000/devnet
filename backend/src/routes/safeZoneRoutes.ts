import { Router } from "express";
import {
  getAllSafeZones,
  createSafeZone,
  updateSafeZone,
  deleteSafeZone,
} from "../controllers/safeZoneController";
import authenticateToken from "../middlewares/authenticateToken";

const router = Router();

router.get("/", getAllSafeZones);
router.post("/", authenticateToken, createSafeZone);
router.put("/:id", authenticateToken, updateSafeZone);
router.delete("/:id", authenticateToken, deleteSafeZone);

export default router;
