import { Router } from "express";
import { detectLocation, getAvailableLocations } from "../controllers/locationController";

const router = Router();

router.get("/detect", detectLocation);
router.get("/available", getAvailableLocations);

export default router;
