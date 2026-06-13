import { Router } from "express";
import {
  createReport,
  verifyReport,
  getAllReports,
  getReportById,
  getAllReportLocations,
  changeReportStatus,
  deleteReport,
  updateReport,
  pingNearbyVolunteers,
} from "../controllers/reportController";
import { uploadImage } from "../controllers/authController";
import authenticateToken from "../middlewares/authenticateToken";
import requireAdmin from "../middlewares/requireAdmin";

const router = Router();

router.post("/reports", uploadImage, createReport);
router.put("/reports/verify/:id", authenticateToken, verifyReport);
router.get("/reports", getAllReports);
router.get("/reports/:id", getReportById);
router.get("/reportsLocation", getAllReportLocations);
router.put("/reports/:id/status", changeReportStatus);
router.delete("/reports/:id", authenticateToken, deleteReport);
router.put("/reports/:id", authenticateToken, updateReport);
router.post("/reports/:id/ping-volunteers", authenticateToken, requireAdmin, pingNearbyVolunteers);

export default router;
