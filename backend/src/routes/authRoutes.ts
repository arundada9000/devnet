import { Router } from "express";
import {
  registerUser,
  loginUser,
  getUserById,
  getAllUsersAroundLocation,
  verifyUser,
  updateProfile,
  updateUserRole,
  deleteUser,
} from "../controllers/authController";
import authenticateToken from "../middlewares/authenticateToken";
import requireAdmin from "../middlewares/requireAdmin";
import User from "../models/userModel";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify", authenticateToken, verifyUser);
router.get("/users/around", getAllUsersAroundLocation);
router.get("/users/:id", getUserById);
router.put("/profile", authenticateToken, updateProfile);

router.get("/users", authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/users/:id/role", authenticateToken, requireAdmin, updateUserRole);
router.delete("/users/:id", authenticateToken, requireAdmin, deleteUser);

export default router;
