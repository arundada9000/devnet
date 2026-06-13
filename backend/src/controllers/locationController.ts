import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import * as turf from "@turf/turf";

// Cache for geojson data
let geoJsonCache: any[] = [];
let isCacheLoaded = false;

const loadGeoJsonData = () => {
  if (isCacheLoaded) return;
  try {
    const geoJsonDir = path.join(__dirname, "../../data/geojson");
    if (!fs.existsSync(geoJsonDir)) {
      console.warn("GeoJSON directory not found:", geoJsonDir);
      return;
    }

    const files = fs.readdirSync(geoJsonDir);
    for (const file of files) {
      if (file.endsWith(".json")) {
        const filePath = path.join(geoJsonDir, file);
        const data = fs.readFileSync(filePath, "utf-8");
        geoJsonCache.push(JSON.parse(data));
      }
    }
    isCacheLoaded = true;
    console.log(`Loaded ${geoJsonCache.length} GeoJSON files.`);
  } catch (err) {
    console.error("Error loading GeoJSON data:", err);
  }
};

export const detectLocation = (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.query;

    if (lat == null || lng == null) {
      res.status(400).json({ message: "Latitude and longitude are required." });
      return;
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);

    if (isNaN(latitude) || isNaN(longitude)) {
      res.status(400).json({ message: "Invalid latitude or longitude." });
      return;
    }

    loadGeoJsonData();

    const point = turf.point([longitude, latitude]);
    let matchedName = "Unknown";

    for (const gj of geoJsonCache) {
      if ((turf as any).booleanPointInPolygon(point, gj)) {
        matchedName = gj.properties?.GaPa_NaPa || "Unknown";
        break;
      }
    }

    res.status(200).json({ localGovName: matchedName });
  } catch (error) {
    console.error("Error detecting location:", error);
    res.status(500).json({ message: "Server error during location detection." });
  }
};

// GET /api/location/available — return all available location names from geojson data
export const getAvailableLocations = (_req: Request, res: Response) => {
  try {
    loadGeoJsonData();
    const locations = geoJsonCache
      .map((gj) => gj.properties?.GaPa_NaPa)
      .filter(Boolean)
      .sort();
    res.status(200).json(locations);
  } catch (error) {
    console.error("Error getting available locations:", error);
    res.status(500).json({ message: "Server error." });
  }
};
