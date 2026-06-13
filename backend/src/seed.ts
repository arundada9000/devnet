import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config({ path: path.join(__dirname, "../.env") });

import ContactInfo from "./models/contactModel";

const MONGODB_URI = process.env.MONGODB_URI || "";

const seedData = [
  {
    localGovName: "Butwal",
    department: "fire",
    contacts: [
      { name: "Butwal Fire Dept", phone: "9876543210", description: "2 km away" },
      { name: "Butwal Fire Dept", phone: "9801234567", description: "8 km away" },
      { name: "Rupandehi Fire HQ", phone: "9872245678", description: "8 km away" },
    ],
  },
  {
    localGovName: "Butwal",
    department: "police",
    contacts: [
      { name: "Butwal Police Station", phone: "9801112233", description: "1.2 km away" },
      { name: "Traffic Police Rupandehi", phone: "9802223344", description: "3.5 km away" },
      { name: "Area Police Butwal", phone: "9803334455", description: "5.1 km away" },
    ],
  },
  {
    localGovName: "Butwal",
    department: "flood",
    contacts: [
      { name: "Flood Rescue Butwal", phone: "9804445566", description: "1.8 km away" },
      { name: "Rupandehi Water Dept", phone: "9805556677", description: "4.2 km away" },
      { name: "Disaster Response Butwal", phone: "9806667788", description: "6 km away" },
    ],
  },
  {
    localGovName: "Butwal",
    department: "accident",
    contacts: [
      { name: "Traffic Emergency Butwal", phone: "9807778899", description: "2.5 km away" },
      { name: "Road Safety Butwal", phone: "9808889900", description: "5.8 km away" },
      { name: "Emergency Ambulance Rupandehi", phone: "9809990011", description: "7.3 km away" },
    ],
  },
  {
    localGovName: "Butwal",
    department: "landslide",
    contacts: [
      { name: "Landslide Rescue Butwal", phone: "9810001122", description: "3.0 km away" },
      { name: "Geo Disaster Team", phone: "9811112233", description: "6.4 km away" },
      { name: "Butwal Disaster Control", phone: "9812223344", description: "9.1 km away" },
    ],
  },
  {
    localGovName: "Butwal",
    department: "other",
    contacts: [
      { name: "Animal Control Butwal", phone: "9813334455", description: "1.7 km away" },
      { name: "Gas Leak Response", phone: "9814445566", description: "3.8 km away" },
      { name: "Misc Emergency Service", phone: "9815556677", description: "6.9 km away" },
    ],
  },
  {
    localGovName: "Tilottama",
    department: "fire",
    contacts: [
      { name: "Tillotama Fire Dept", phone: "9876543210", description: "2 km away" },
      { name: "Tillotama Fire Dept", phone: "9801234567", description: "8 km away" },
      { name: "Tillotama Fire HQ", phone: "9872245678", description: "8 km away" },
    ],
  },
  {
    localGovName: "Tilottama",
    department: "police",
    contacts: [
      { name: "Tilottama Police Station", phone: "9801112233", description: "1.5 km away" },
      { name: "Traffic Police Tilottama", phone: "9802223344", description: "3.0 km away" },
      { name: "Area Police Tilottama", phone: "9803334455", description: "5.0 km away" },
    ],
  },
  {
    localGovName: "Tilottama",
    department: "flood",
    contacts: [
      { name: "Flood Rescue Tilottama", phone: "9804445566", description: "2.0 km away" },
      { name: "Tilottama Water Dept", phone: "9805556677", description: "4.5 km away" },
      { name: "Disaster Response Tilottama", phone: "9806667788", description: "6.5 km away" },
    ],
  },
  {
    localGovName: "Tilottama",
    department: "accident",
    contacts: [
      { name: "Traffic Emergency Tilottama", phone: "9807778899", description: "2.0 km away" },
      { name: "Road Safety Tilottama", phone: "9808889900", description: "5.5 km away" },
      { name: "Emergency Ambulance Tilottama", phone: "9809990011", description: "7.0 km away" },
    ],
  },
  {
    localGovName: "Tilottama",
    department: "landslide",
    contacts: [
      { name: "Landslide Rescue Tilottama", phone: "9810001122", description: "3.5 km away" },
      { name: "Geo Disaster Team Tilottama", phone: "9811112233", description: "6.0 km away" },
      { name: "Tilottama Disaster Control", phone: "9812223344", description: "9.0 km away" },
    ],
  },
  {
    localGovName: "Tilottama",
    department: "other",
    contacts: [
      { name: "Animal Control Tilottama", phone: "9813334455", description: "1.5 km away" },
      { name: "Gas Leak Response Tilottama", phone: "9814445566", description: "4.0 km away" },
      { name: "Misc Emergency Tilottama", phone: "9815556677", description: "7.0 km away" },
    ],
  },
  {
    localGovName: "Omsatiya",
    department: "fire",
    contacts: [
      { name: "Omsatiya Fire Dept", phone: "9876543210", description: "2 km away" },
      { name: "Omsatiya Fire Dept", phone: "9801234567", description: "8 km away" },
      { name: "Rupandehi Fire HQ", phone: "9872245678", description: "8 km away" },
    ],
  },
  {
    localGovName: "Omsatiya",
    department: "police",
    contacts: [
      { name: "Omsatiya Police Station", phone: "9801112233", description: "1.0 km away" },
      { name: "Traffic Police Omsatiya", phone: "9802223344", description: "3.2 km away" },
      { name: "Area Police Omsatiya", phone: "9803334455", description: "5.5 km away" },
    ],
  },
  {
    localGovName: "Omsatiya",
    department: "flood",
    contacts: [
      { name: "Flood Rescue Omsatiya", phone: "9804445566", description: "1.5 km away" },
      { name: "Omsatiya Water Dept", phone: "9805556677", description: "4.0 km away" },
      { name: "Disaster Response Omsatiya", phone: "9806667788", description: "6.0 km away" },
    ],
  },
  {
    localGovName: "Omsatiya",
    department: "accident",
    contacts: [
      { name: "Traffic Emergency Omsatiya", phone: "9807778899", description: "2.0 km away" },
      { name: "Road Safety Omsatiya", phone: "9808889900", description: "5.0 km away" },
      { name: "Emergency Ambulance Omsatiya", phone: "9809990011", description: "7.5 km away" },
    ],
  },
  {
    localGovName: "Omsatiya",
    department: "landslide",
    contacts: [
      { name: "Landslide Rescue Omsatiya", phone: "9810001122", description: "3.0 km away" },
      { name: "Geo Disaster Team Omsatiya", phone: "9811112233", description: "6.5 km away" },
      { name: "Omsatiya Disaster Control", phone: "9812223344", description: "9.0 km away" },
    ],
  },
  {
    localGovName: "Omsatiya",
    department: "other",
    contacts: [
      { name: "Animal Control Omsatiya", phone: "9813334455", description: "2.0 km away" },
      { name: "Gas Leak Response Omsatiya", phone: "9814445566", description: "4.0 km away" },
      { name: "Misc Emergency Omsatiya", phone: "9815556677", description: "7.0 km away" },
    ],
  },
  {
    localGovName: "Siddharthanagar",
    department: "fire",
    contacts: [
      { name: "Bhairahawa Fire Dept", phone: "9876543210", description: "2 km away" },
      { name: "Siddharthanagar Fire Dept", phone: "9801234567", description: "8 km away" },
      { name: "Siddharthanagar Fire HQ", phone: "9872245678", description: "10 km away" },
    ],
  },
  {
    localGovName: "Siddharthanagar",
    department: "police",
    contacts: [
      { name: "Bhairahawa Police Station", phone: "9801112233", description: "1.0 km away" },
      { name: "Traffic Police Siddharthanagar", phone: "9802223344", description: "3.0 km away" },
      { name: "Area Police Siddharthanagar", phone: "9803334455", description: "5.0 km away" },
    ],
  },
  {
    localGovName: "Siddharthanagar",
    department: "flood",
    contacts: [
      { name: "Flood Rescue Siddharthanagar", phone: "9804445566", description: "2.0 km away" },
      { name: "Siddharthanagar Water Dept", phone: "9805556677", description: "4.5 km away" },
      { name: "Disaster Response Siddharthanagar", phone: "9806667788", description: "6.0 km away" },
    ],
  },
  {
    localGovName: "Siddharthanagar",
    department: "accident",
    contacts: [
      { name: "Traffic Emergency Bhairahawa", phone: "9807778899", description: "2.5 km away" },
      { name: "Road Safety Siddharthanagar", phone: "9808889900", description: "5.5 km away" },
      { name: "Emergency Ambulance Siddharthanagar", phone: "9809990011", description: "7.0 km away" },
    ],
  },
  {
    localGovName: "Siddharthanagar",
    department: "landslide",
    contacts: [
      { name: "Landslide Rescue Siddharthanagar", phone: "9810001122", description: "3.5 km away" },
      { name: "Geo Disaster Team Siddharthanagar", phone: "9811112233", description: "6.5 km away" },
      { name: "Siddharthanagar Disaster Control", phone: "9812223344", description: "9.5 km away" },
    ],
  },
  {
    localGovName: "Siddharthanagar",
    department: "other",
    contacts: [
      { name: "Animal Control Siddharthanagar", phone: "9813334455", description: "1.5 km away" },
      { name: "Gas Leak Response Bhairahawa", phone: "9814445566", description: "4.0 km away" },
      { name: "Misc Emergency Siddharthanagar", phone: "9815556677", description: "7.0 km away" },
    ],
  },
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    await ContactInfo.deleteMany({});
    console.log("Cleared existing contact data.");

    const result = await ContactInfo.insertMany(seedData);
    console.log(`Seeded ${result.length} contact records successfully!`);
  } catch (err) {
    console.error("Seed failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seed();
