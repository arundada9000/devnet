import { Request, Response } from "express";
import User from "../models/userModel";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import bcrypt from "bcrypt";
import { env } from "../env";
import { resolveGaPa } from "../utils/resolveGaPa";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (extname && mimeType) {
      return cb(null, true);
    } else {
      return cb(null, false);
    }
  },
});

export const uploadImage = upload.single("image");

export const validateCredentials = (username?: string, password?: string) => {
  const errors: string[] = [];

  if (username) {
    if (!username.trim()) {
      errors.push("Username is required");
    }
    if (!/^[a-zA-Z]+$/.test(username.trim())) {
      errors.push("Username must contain only alphabetic characters");
    }
    if (username.length < 3 || username.length > 20) {
      errors.push("Username must be between 3 and 20 characters");
    }
  }

  if (password) {
    if (!password.trim()) {
      errors.push("Password is required");
    }
    if (password.length < 6) {
      errors.push("Password must be at least 6 characters");
    }
  }

  return errors;
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, password, phoneNumber, latitude, longitude } = req.body;

    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      res.status(409).json({ message: "Phone number already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const localGovName = resolveGaPa(lat, lng);

    const user = new User({
      username,
      password: hashedPassword,
      phoneNumber,
      localGovName,
      location: {
        type: "Point",
        coordinates: [lng || 0, lat || 0],
      },
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error: any) {
    console.error("REGISTER ERROR:", error?.message);
    res.status(400).json({
      message: "Error registering user",
      error: error?.message || error,
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      res.status(400).json({ message: "Phone and password are required" });
      return;
    }

    const user = await User.findOne({ phoneNumber: phone });
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, { httpOnly: true });
    res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error: any) {
    console.error("LOGIN ERROR:", error?.message);
    res.status(400).json({
      message: "Error logging in",
      error: error?.message || error,
    });
  }
};

export const verifyUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error verifying user", error });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: "Error fetching user", error });
  }
};

export const getAllUsersAroundLocation = async (req: Request, res: Response) => {
  try {
    const { longitude, latitude, radius } = req.query;
    const users = await User.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
          },
          $maxDistance: Number(radius) || 5000,
        },
      },
    });
    res.json(users);
  } catch (error) {
    res.status(400).json({ message: "Error fetching users", error });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const allowedFields = [
      "username", "phoneNumber", "email", "gender",
      "citizenshipId", "address",
    ];

    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ message: "No valid fields to update" });
      return;
    }

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      select: "-password",
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ message: "Profile updated", user });
  } catch (error: any) {
    console.error("Update profile error:", error?.message);
    res.status(500).json({ message: "Server error", error: error?.message });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!["user", "admin"].includes(role)) {
    res.status(400).json({ message: "Invalid role" });
    return;
  }

  try {
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ message: "Role updated", user });
  } catch (err) {
    console.error("Role update failed", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
