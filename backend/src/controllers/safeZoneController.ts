import { Request, Response } from "express";
import SafeZone from "../models/safeZoneModel";

// Get all active safe zones (public)
export const getAllSafeZones = async (_: Request, res: Response) => {
  try {
    const zones = await SafeZone.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(zones);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch safe zones.", error: err });
  }
};

// Create a new safe zone (admin only)
export const createSafeZone = async (req: Request, res: Response) => {
  try {
    const { name, type, coordinates, address, phone } = req.body;

    if (!name || !type || !coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
      res.status(400).json({ message: "Name, type, and coordinates [lng, lat] are required." });
      return;
    }

    const zone = await SafeZone.create({
      name,
      type,
      location: { coordinates },
      address: address || "",
      phone: phone || "",
    });

    res.status(201).json(zone);
  } catch (err) {
    res.status(500).json({ message: "Failed to create safe zone.", error: err });
  }
};

// Update a safe zone (admin only)
export const updateSafeZone = async (req: Request, res: Response) => {
  try {
    const { name, type, coordinates, address, phone, isActive } = req.body;
    const updateData: any = {};

    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (coordinates && Array.isArray(coordinates) && coordinates.length >= 2) {
      updateData.location = { type: "Point", coordinates };
    }
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await SafeZone.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updated) {
      res.status(404).json({ message: "Safe zone not found." });
      return;
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update safe zone.", error: err });
  }
};

// Delete a safe zone (admin only)
export const deleteSafeZone = async (req: Request, res: Response) => {
  try {
    const deleted = await SafeZone.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "Safe zone not found." });
      return;
    }
    res.json({ message: "Safe zone deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete safe zone.", error: err });
  }
};
