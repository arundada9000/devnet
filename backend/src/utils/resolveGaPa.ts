import fs from "fs";
import path from "path";
import * as turf from "@turf/turf";

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
    console.log(`[resolveGaPa] Loaded ${geoJsonCache.length} GeoJSON files.`);
  } catch (err) {
    console.error("[resolveGaPa] Error loading GeoJSON data:", err);
  }
};

export function resolveGaPa(lat: number, lng: number): string {
  if (lat == null || isNaN(lat) || lng == null || isNaN(lng)) return "Unknown";

  loadGeoJsonData();

  try {
    const point = turf.point([lng, lat]);
    for (const gj of geoJsonCache) {
      if ((turf as any).booleanPointInPolygon(point, gj)) {
        return gj.properties?.GaPa_NaPa || "Unknown";
      }
    }
  } catch (err) {
    console.error("[resolveGaPa] Error:", err);
  }

  return "Unknown";
}
