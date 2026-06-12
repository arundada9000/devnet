import { Request, Response } from "express";
import Report from "../models/reportModel";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { resolveGaPa } from "../utils/resolveGaPa";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (buffer: Buffer, folder: string): Promise<{ secure_url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error || new Error("No result from Cloudinary"));
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

export const createReport = async (req: Request, res: Response) => {
  const allowedTypes = [
    "fire", "police", "flood", "accident", "landslide", "other",
  ];

  try {
    const { type, description, location } = req.body;

    if (!type || typeof type !== "string" || !allowedTypes.includes(type)) {
      res.status(400).json({
        message: `Invalid type. It must be one of: ${allowedTypes.join(", ")}.`,
      });
      return;
    }

    if (!description || typeof description !== "string" || description.length < 10) {
      res.status(400).json({
        message: "Description must be a string and at least 10 characters long.",
      });
      return;
    }

    const parsedLocation = JSON.parse(location);
    if (!parsedLocation) {
      res.status(400).json({ message: "Location must be a valid JSON string." });
      return;
    }

    let imageUrl = "";
    let imageId = "";

    if (req.file && req.file.buffer) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, "reports");
        imageUrl = result.secure_url;
        imageId = result.public_id;
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
      }
    }

    const [lng, lat] = parsedLocation;
    const localGovName = resolveGaPa(lat, lng);

    const report = new Report({
      type,
      description,
      location: { coordinates: parsedLocation },
      localGovName,
      imageUrl,
      imageId,
    });

    await report.save();

    res.status(201).json({
      message: "Report created successfully",
      report,
    });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(400).json({ message: "Error creating report", error });
  }
};

export const verifyReport = async (req: Request, res: Response) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      res.status(404).json({ message: "Report not found" });
      return;
    }
    if (req.user?.role !== "admin") {
      res.status(403).json({ message: "Admin access required" });
      return;
    }

    report.status = "verified";
    report.verifiedBy = req.user.id;
    await report.save();
    res.json({ message: "Report verified", report });
  } catch (error) {
    res.status(400).json({ message: "Error verifying report", error });
  }
};

export const getAllReports = async (_req: Request, res: Response) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(400).json({ message: "Error fetching reports", error });
  }
};

export const getReportById = async (req: Request, res: Response) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      res.status(404).json({ message: "Report not found" });
      return;
    }
    res.json(report);
  } catch (error) {
    res.status(400).json({ message: "Error fetching report", error });
  }
};

dayjs.extend(relativeTime);

export const getAllReportLocations = async (_req: Request, res: Response) => {
  try {
    const reports = await Report.find(
      {},
      { location: 1, type: 1, _id: 1, createdAt: 1 }
    );
    const formattedReports = reports.map((report) => {
      const c = report.location.coordinates;
      const isNewFormat = c[0] > 70;
      const lng = isNewFormat ? c[0] : c[1];
      const lat = isNewFormat ? c[1] : c[0];

      return {
        id: report._id,
        title: `${report.type.charAt(0).toUpperCase() + report.type.slice(1)} reported`,
        type: report.type,
        lat,
        lng,
        time: dayjs(report.createdAt).fromNow(),
      };
    });
    res.json(formattedReports);
  } catch (error) {
    res.status(400).json({ message: "Error fetching report locations", error });
  }
};

export const changeReportStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) {
      res.status(404).json({ message: "Report not found" });
      return;
    }
    report.status = status;
    await report.save();
    res.json({ message: "Report status updated", report });
  } catch (error) {
    res.status(400).json({ message: "Error updating report status", error });
  }
};

export const deleteReport = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deleted = await Report.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ message: "Report not found" });
      return;
    }
    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting report", error });
  }
};

export const updateReport = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { type, description, status, location } = req.body;

  try {
    const report = await Report.findById(id);
    if (!report) {
      res.status(404).json({ message: "Report not found" });
      return;
    }

    if (type) report.type = type;
    if (description) report.description = description;
    if (status) report.status = status;
    if (location && Array.isArray(location) && location.length >= 2) {
      report.location.coordinates = [location[0], location[1]];
    }

    if (req.file && req.file.buffer) {
      if (report.imageId) {
        try {
          await cloudinary.uploader.destroy(report.imageId);
        } catch (err) {
          console.error("Failed to delete old Cloudinary image:", err);
        }
      }

      const result = await uploadToCloudinary(req.file.buffer, "reports");
      report.imageUrl = result.secure_url;
      report.imageId = result.public_id;
    }

    await report.save();

    res.status(200).json({ message: "Report updated successfully", report });
  } catch (error) {
    res.status(500).json({ message: "Error updating report", error });
  }
};
