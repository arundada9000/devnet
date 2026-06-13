import { Request, Response } from "express";
import Alert from "../models/alertModel";
import { sendPushToAll } from "./pushController";

// Create a new alert
export const createAlert = async (req: Request, res: Response) => {
  try {
    const { title, description, type, location } = req.body;
    const createdBy = req.user?.id;

    const newAlert = await Alert.create({
      title,
      description,
      type,
      location,
      createdBy,
    });

    // Send push notification to all subscribers (non-blocking)
    try {
      await sendPushToAll(
        `⚠️ ${title}`,
        `${type?.charAt(0).toUpperCase()}${type?.slice(1)} alert in ${location}: ${description?.substring(0, 100)}`,
        "/dashboard/home"
      );
    } catch (pushErr) {
      console.warn("[Alert] Push notification failed (non-critical):", pushErr);
    }

    res.status(201).json(newAlert);
  } catch (err) {
    console.error("[Alert] Failed to create alert:", err);
    res.status(500).json({ message: "Failed to create alert", error: err instanceof Error ? err.message : err });
  }
};

// Get all alerts
export const getAllAlerts = async (_: Request, res: Response) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch alerts", error: err });
  }
};

// Update alert
export const updateAlert = async (req: Request, res: Response) => {
  try {
    const updated = await Alert.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) {
      res.status(404).json({ message: "Alert not found" });
      return;
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update alert", error: err });
  }
};

// Delete alert
export const deleteAlert = async (req: Request, res: Response) => {
  try {
    const deleted = await Alert.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "Alert not found" });
      return;
    }
    res.json({ message: "Alert deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete alert", error: err });
  }
};
