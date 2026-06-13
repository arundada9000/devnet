import mongoose from "mongoose";
import dotenv from "dotenv";
import SafeZone from "./models/safeZoneModel";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in .env");
  process.exit(1);
}

const seedData = [
  {
    name: "Lumbini Provincial Hospital",
    type: "hospital",
    location: { type: "Point", coordinates: [83.468, 27.7] },
    address: "Hospital Line, Butwal",
    phone: "071-540300",
    isActive: true,
  },
  {
    name: "Area Police Office Butwal",
    type: "police",
    location: { type: "Point", coordinates: [83.45, 27.71] },
    address: "Rajmarg Chauraha, Butwal",
    phone: "100",
    isActive: true,
  },
  {
    name: "Lumbini Engineering College Shelter",
    type: "shelter",
    location: { type: "Point", coordinates: [83.475, 27.68] },
    address: "Bhalwari, Rupandehi",
    phone: "071-561030",
    isActive: true,
  },
  {
    name: "Butwal Fire Brigade",
    type: "fire_station",
    location: { type: "Point", coordinates: [83.462, 27.705] },
    address: "Amarpath, Butwal",
    phone: "101",
    isActive: true,
  },
  {
    name: "Devinagar Relief Distribution Center",
    type: "distribution",
    location: { type: "Point", coordinates: [83.48, 27.69] },
    address: "Devinagar, Butwal-11",
    phone: "9800000000",
    isActive: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log("Connected to MongoDB");

    await SafeZone.deleteMany({});
    console.log("Cleared existing Safe Zones");

    await SafeZone.insertMany(seedData);
    console.log("Successfully seeded 5 Safe Zones!");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
