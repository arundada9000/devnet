import { Router } from "express";
import { detectLocation, getAvailableLocations } from "../controllers/locationController";

const router = Router();

// GET /api/location/detect
router.get("/detect", detectLocation);

// GET /api/location/available
router.get("/available", getAvailableLocations);

export default router;
