import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: Number(process.env["PORT"]) || 3000,
  MONGODB_URI: process.env["MONGODB_URI"] || "",
  JWT_SECRET: process.env["JWT_SECRET"] || "",
  CLIENT_URL: process.env["CLIENT_URL"] || "http://localhost:5173",
  CLOUDINARY_CLOUD_NAME: process.env["CLOUDINARY_CLOUD_NAME"] || "",
  CLOUDINARY_API_KEY: process.env["CLOUDINARY_API_KEY"] || "",
  CLOUDINARY_API_SECRET: process.env["CLOUDINARY_API_SECRET"] || "",
  VAPID_PUBLIC_KEY: process.env["VAPID_PUBLIC_KEY"] || "",
  VAPID_PRIVATE_KEY: process.env["VAPID_PRIVATE_KEY"] || "",
};
