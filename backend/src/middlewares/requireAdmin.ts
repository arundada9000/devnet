import { Request, Response, NextFunction } from "express";
import { IUser } from "./authenticateToken"; // Adjust path if needed

export default function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = req.user as IUser;

  if (!user || user.role !== "admin") {
    res.status(403).json({ message: "Access denied. Admins only." });
    return;
  }

  next();
}
