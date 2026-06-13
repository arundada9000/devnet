import "dotenv/config";
import express from "express";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import alertRoutes from "./routes/alertRoutes";
import reportRoutes from "./routes/reportRoutes";
import contactRoutes from "./routes/contactRoutes";
import locationRoutes from "./routes/locationRoutes";
import pushRoutes from "./routes/pushRoutes";
import safeZoneRoutes from "./routes/safeZoneRoutes";
import smsRoutes from "./routes/smsRoutes";
import cookieParser from "cookie-parser";
import cors from "cors";
import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
const app = express();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.CLIENT_URL || "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
      ];
      // Allow Vercel preview and production deployments automatically
      if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
); // Apply CORS middleware with the configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", reportRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/push", pushRoutes);
app.use("/api/safe-zones", safeZoneRoutes);
app.use("/api/webhook", smsRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled Error:", err.stack || err);
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ success: false, message });
});

// Start the server if running locally, otherwise export for Vercel Serverless
if (process.env.NODE_ENV !== 'production' || process.env.IS_LOCAL === 'true') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express API
export default app;
