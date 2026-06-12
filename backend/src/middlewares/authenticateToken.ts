import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../env";

export type IUser = {
  id: string;
  role: "user" | "admin";
};

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  jwt.verify(
    token,
    env.JWT_SECRET,
    (err: Error | null, decoded: any) => {
      if (err) {
        res.status(403).json({ message: "Invalid or expired token" });
        return;
      }
      req.user = decoded as IUser;
      next();
    }
  );
};

export default authenticateToken;
