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
} from "../controllers/reportController";
import { uploadImage } from "../controllers/authController";
import authenticateToken from "../middlewares/authenticateToken";

const router = Router();

router.post("/reports", uploadImage, createReport);
router.get("/reports", getAllReports);
router.get("/reports/:id", getReportById);
router.get("/reportsLocation", getAllReportLocations);
router.put("/reports/verify/:id", authenticateToken, verifyReport);
router.put("/reports/:id/status", changeReportStatus);
router.put("/reports/:id", authenticateToken, updateReport);
router.delete("/reports/:id", authenticateToken, deleteReport);

export default router;
