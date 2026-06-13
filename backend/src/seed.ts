import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config({ path: path.join(__dirname, "../.env") });

// Import the model
import ContactInfo from "./models/contactModel";

const MONGODB_URI = process.env.MONGODB_URI || "";

const seedData = [
  // ===== BUTWAL =====
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

  // ===== TILLOTAMA =====
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

  // ===== OMSATIYA =====
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

  // ===== SIDDHARTHANAGAR =====
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

  // ===== SHUKLAGANDAKI =====
  {
    localGovName: "Shuklagandaki",
    department: "fire",
    contacts: [
      { name: "Shuklagandaki Fire Post", phone: "9846000112", description: "2.0 km away" },
      { name: "Tanahu Fire HQ", phone: "9846111223", description: "8.0 km away" },
      { name: "Damauli Fire Service", phone: "9846222334", description: "12.0 km away" },
    ],
  },
  {
    localGovName: "Shuklagandaki",
    department: "police",
    contacts: [
      { name: "Shuklagandaki Police Station", phone: "9846333445", description: "1.5 km away" },
      { name: "Traffic Police Shuklagandaki", phone: "9846444556", description: "3.0 km away" },
      { name: "Area Police Office Damauli", phone: "9846555667", description: "10.0 km away" },
    ],
  },
  {
    localGovName: "Shuklagandaki",
    department: "flood",
    contacts: [
      { name: "Shuklagandaki Flood Rescue", phone: "9846666778", description: "2.5 km away" },
      { name: "Seti River Rescue Team", phone: "9846777889", description: "5.0 km away" },
      { name: "Disaster Response Tanahu", phone: "9846888990", description: "9.0 km away" },
    ],
  },
  {
    localGovName: "Shuklagandaki",
    department: "accident",
    contacts: [
      { name: "Traffic Emergency Shuklagandaki", phone: "9856000113", description: "2.0 km away" },
      { name: "Road Safety Shuklagandaki", phone: "9856111224", description: "4.5 km away" },
      { name: "Emergency Ambulance Tanahu", phone: "9856222335", description: "8.0 km away" },
    ],
  },
  {
    localGovName: "Shuklagandaki",
    department: "landslide",
    contacts: [
      { name: "Landslide Rescue Shuklagandaki", phone: "9856333446", description: "3.5 km away" },
      { name: "Hill Response Tanahu", phone: "9856444557", description: "6.0 km away" },
      { name: "Shuklagandaki Disaster Control", phone: "9856555668", description: "10.0 km away" },
    ],
  },
  {
    localGovName: "Shuklagandaki",
    department: "other",
    contacts: [
      { name: "Animal Control Shuklagandaki", phone: "9856666779", description: "2.0 km away" },
      { name: "Gas Leak Response Shuklagandaki", phone: "9856777880", description: "5.0 km away" },
      { name: "Misc Emergency Shuklagandaki", phone: "9856888991", description: "9.0 km away" },
    ],
  },

  // =====================================================================
  // KATHMANDU VALLEY — Kathmandu District
  // =====================================================================

  // ===== KATHMANDU =====
  {
    localGovName: "Kathmandu",
    department: "fire",
    contacts: [
      { name: "Kathmandu Metropolitan Fire Brigade", phone: "9841122334", description: "1.5 km away" },
      { name: "Kathmandu Fire Station (Ratna Park)", phone: "9842233445", description: "3.0 km away" },
      { name: "KMC Emergency Response", phone: "9843344556", description: "5.0 km away" },
    ],
  },
  {
    localGovName: "Kathmandu",
    department: "police",
    contacts: [
      { name: "Kathmandu Police HQ", phone: "9844455667", description: "1.0 km away" },
      { name: "Traffic Police Kathmandu", phone: "9845566778", description: "2.5 km away" },
      { name: "Metropolitan Police Range", phone: "9846677889", description: "4.0 km away" },
    ],
  },
  {
    localGovName: "Kathmandu",
    department: "flood",
    contacts: [
      { name: "KMC Flood Rescue Team", phone: "9847788990", description: "2.0 km away" },
      { name: "Bagmati River Rescue", phone: "9848899001", description: "4.5 km away" },
      { name: "Disaster Management Kathmandu", phone: "9849900112", description: "6.0 km away" },
    ],
  },
  {
    localGovName: "Kathmandu",
    department: "accident",
    contacts: [
      { name: "Traffic Emergency Kathmandu", phone: "9850011223", description: "1.5 km away" },
      { name: "Road Safety KMC", phone: "9851122334", description: "3.5 km away" },
      { name: "Emergency Ambulance Kathmandu", phone: "9852233445", description: "5.0 km away" },
    ],
  },
  {
    localGovName: "Kathmandu",
    department: "landslide",
    contacts: [
      { name: "Landslide Rescue Kathmandu", phone: "9853344556", description: "3.0 km away" },
      { name: "Geo Disaster Team Bagmati", phone: "9854455667", description: "6.0 km away" },
      { name: "KMC Disaster Control Room", phone: "9855566778", description: "8.0 km away" },
    ],
  },
  {
    localGovName: "Kathmandu",
    department: "other",
    contacts: [
      { name: "Animal Control Kathmandu", phone: "9856677889", description: "2.0 km away" },
      { name: "Gas Leak Response KMC", phone: "9857788990", description: "4.0 km away" },
      { name: "Misc Emergency Kathmandu", phone: "9858899001", description: "6.5 km away" },
    ],
  },

  // ===== BUDHANILAKANTHA =====
  {
    localGovName: "Budhanilakantha",
    department: "fire",
    contacts: [
      { name: "Budhanilakantha Fire Post", phone: "9841011122", description: "1.5 km away" },
      { name: "Kathmandu Metro Fire Backup", phone: "9842022233", description: "6.0 km away" },
      { name: "BNL Emergency Services", phone: "9843033344", description: "8.0 km away" },
    ],
  },
  {
    localGovName: "Budhanilakantha",
    department: "police",
    contacts: [
      { name: "Budhanilakantha Police Station", phone: "9844044455", description: "1.0 km away" },
      { name: "Traffic Police Budhanilakantha", phone: "9845055566", description: "2.5 km away" },
      { name: "Area Police Office Narayanthan", phone: "9846066677", description: "4.0 km away" },
    ],
  },
  {
    localGovName: "Budhanilakantha",
    department: "flood",
    contacts: [
      { name: "Bishnumati Flood Rescue", phone: "9847077788", description: "2.0 km away" },
      { name: "BNL Disaster Response", phone: "9848088899", description: "4.5 km away" },
      { name: "Flood Control Budhanilakantha", phone: "9849099900", description: "6.0 km away" },
    ],
  },
  {
    localGovName: "Budhanilakantha",
    department: "accident",
    contacts: [
      { name: "Traffic Emergency BNL", phone: "9850111222", description: "2.0 km away" },
      { name: "Road Safety Budhanilakantha", phone: "9850222333", description: "4.0 km away" },
      { name: "Emergency Ambulance BNL", phone: "9850333444", description: "6.5 km away" },
    ],
  },
  {
    localGovName: "Budhanilakantha",
    department: "landslide",
    contacts: [
      { name: "Landslide Rescue BNL", phone: "9850444555", description: "3.0 km away" },
      { name: "Hill Slope Response Team", phone: "9850555666", description: "5.5 km away" },
      { name: "BNL Disaster Control", phone: "9850666777", description: "7.0 km away" },
    ],
  },
  {
    localGovName: "Budhanilakantha",
    department: "other",
    contacts: [
      { name: "Animal Control BNL", phone: "9850777888", description: "1.5 km away" },
      { name: "Gas Leak Response BNL", phone: "9850888999", description: "3.5 km away" },
      { name: "Misc Emergency Budhanilakantha", phone: "9850999000", description: "6.0 km away" },
    ],
  },

  // ===== CHANDRAGIRI =====
  {
    localGovName: "Chandragiri",
    department: "fire",
    contacts: [
      { name: "Chandragiri Fire Post", phone: "9841112223", description: "2.0 km away" },
      { name: "Thankot Fire Service", phone: "9841222334", description: "4.5 km away" },
      { name: "KMC Fire Backup", phone: "9841333445", description: "10.0 km away" },
    ],
  },
  {
    localGovName: "Chandragiri",
    department: "police",
    contacts: [
      { name: "Thankot Police Station", phone: "9841444556", description: "1.5 km away" },
      { name: "Chandragiri Area Police", phone: "9841555667", description: "3.0 km away" },
      { name: "Traffic Police Chandragiri", phone: "9841666778", description: "5.0 km away" },
    ],
  },
  {
    localGovName: "Chandragiri",
    department: "flood",
    contacts: [
      { name: "Chandragiri Flood Rescue", phone: "9841777889", description: "2.5 km away" },
      { name: "Naubise Flood Response", phone: "9841888990", description: "5.0 km away" },
      { name: "Disaster Response Chandragiri", phone: "9841999001", description: "7.0 km away" },
    ],
  },
  {
    localGovName: "Chandragiri",
    department: "accident",
    contacts: [
      { name: "Traffic Emergency Chandragiri", phone: "9852000112", description: "2.0 km away" },
      { name: "Highway Rescue Thankot", phone: "9852111223", description: "4.0 km away" },
      { name: "Emergency Ambulance Chandragiri", phone: "9852222334", description: "6.5 km away" },
    ],
  },
  {
    localGovName: "Chandragiri",
    department: "landslide",
    contacts: [
      { name: "Landslide Rescue Chandragiri", phone: "9852333445", description: "3.5 km away" },
      { name: "Hill Slope Response Thankot", phone: "9852444556", description: "6.0 km away" },
      { name: "Chandragiri Disaster Control", phone: "9852555667", description: "8.0 km away" },
    ],
  },
  {
    localGovName: "Chandragiri",
    department: "other",
    contacts: [
      { name: "Animal Control Chandragiri", phone: "9852666778", description: "2.0 km away" },
      { name: "Gas Leak Response Thankot", phone: "9852777889", description: "4.5 km away" },
      { name: "Misc Emergency Chandragiri", phone: "9852888990", description: "7.0 km away" },
    ],
  },

  // ===== DAKSHINKALI =====
  {
    localGovName: "Dakshinkali",
    department: "fire",
    contacts: [
      { name: "Dakshinkali Fire Post", phone: "9843000112", description: "2.0 km away" },
      { name: "Pharping Fire Service", phone: "9843111223", description: "5.0 km away" },
      { name: "KMC Fire Backup", phone: "9843222334", description: "12.0 km away" },
    ],
  },
  {
    localGovName: "Dakshinkali",
    department: "police",
    contacts: [
      { name: "Pharping Police Station", phone: "9843333445", description: "1.5 km away" },
      { name: "Dakshinkali Area Police", phone: "9843444556", description: "3.0 km away" },
      { name: "Traffic Police Dakshinkali", phone: "9843555667", description: "5.5 km away" },
    ],
  },
  {
    localGovName: "Dakshinkali",
    department: "flood",
    contacts: [
      { name: "Dakshinkali Flood Rescue", phone: "9843666778", description: "2.5 km away" },
      { name: "Nakhu River Rescue Team", phone: "9843777889", description: "5.0 km away" },
      { name: "Disaster Response Dakshinkali", phone: "9843888990", description: "7.5 km away" },
    ],
  },
  {
    localGovName: "Dakshinkali",
    department: "accident",
    contacts: [
      { name: "Traffic Emergency Dakshinkali", phone: "9854000112", description: "2.0 km away" },
      { name: "Road Safety Pharping", phone: "9854111223", description: "4.5 km away" },
      { name: "Emergency Ambulance Dakshinkali", phone: "9854222334", description: "7.0 km away" },
    ],
  },
  {
    localGovName: "Dakshinkali",
    department: "landslide",
    contacts: [
      { name: "Landslide Rescue Dakshinkali", phone: "9854333445", description: "3.0 km away" },
      { name: "Hill Response Pharping", phone: "9854444556", description: "5.5 km away" },
      { name: "Dakshinkali Disaster Control", phone: "9854555667", description: "8.0 km away" },
    ],
  },
  {
    localGovName: "Dakshinkali",
    department: "other",
    contacts: [
      { name: "Animal Control Dakshinkali", phone: "9854666778", description: "2.0 km away" },
      { name: "Gas Leak Response Pharping", phone: "9854777889", description: "4.5 km away" },
      { name: "Misc Emergency Dakshinkali", phone: "9854888990", description: "7.0 km away" },
    ],
  },

  // ===== GOKARNESHWOR =====
  {
    localGovName: "Gokarneshwor",
    department: "fire",
    contacts: [
      { name: "Gokarneshwor Fire Post", phone: "9845000112", description: "1.5 km away" },
      { name: "Gokarna Fire Service", phone: "9845111223", description: "4.0 km away" },
      { name: "KMC Fire Backup", phone: "9845222334", description: "8.0 km away" },
    ],
  },
  {
    localGovName: "Gokarneshwor",
    department: "police",
    contacts: [
      { name: "Gokarna Police Station", phone: "9845333445", description: "1.0 km away" },
      { name: "Traffic Police Gokarneshwor", phone: "9845444556", description: "2.5 km away" },
      { name: "Area Police Office Gokarna", phone: "9845555667", description: "4.0 km away" },
    ],
  },
  {
    localGovName: "Gokarneshwor",
    department: "flood",
    contacts: [
      { name: "Gokarneshwor Flood Rescue", phone: "9845666778", description: "2.0 km away" },
      { name: "Bagmati River Rescue Team", phone: "9845777889", description: "4.5 km away" },
      { name: "Disaster Response Gokarneshwor", phone: "9845888990", description: "6.0 km away" },
    ],
  },
  {
    localGovName: "Gokarneshwor",
    department: "accident",
    contacts: [
      { name: "Traffic Emergency Gokarneshwor", phone: "9856000112", description: "2.0 km away" },
      { name: "Road Safety Gokarna", phone: "9856111223", description: "4.0 km away" },
      { name: "Emergency Ambulance Gokarneshwor", phone: "9856222334", description: "6.0 km away" },
    ],
  },
  {
    localGovName: "Gokarneshwor",
    department: "landslide",
    contacts: [
      { name: "Landslide Rescue Gokarneshwor", phone: "9856333445", description: "3.0 km away" },
      { name: "Hill Slope Response Gokarna", phone: "9856444556", description: "5.5 km away" },
      { name: "Gokarneshwor Disaster Control", phone: "9856555667", description: "7.5 km away" },
    ],
  },
  {
    localGovName: "Gokarneshwor",
    department: "other",
    contacts: [
      { name: "Animal Control Gokarneshwor", phone: "9856666778", description: "1.5 km away" },
      { name: "Gas Leak Response Gokarna", phone: "9856777889", description: "4.0 km away" },
      { name: "Misc Emergency Gokarneshwor", phone: "9856888990", description: "6.5 km away" },
    ],
  },

  // ===== KAGESHWORI MANAHORA =====
  {
    localGovName: "Kageshwori Manahora",
    department: "fire",
    contacts: [
      { name: "Kageshwori Fire Post", phone: "9847000112", description: "2.0 km away" },
      { name: "Gokarna Fire Service", phone: "9847111223", description: "5.0 km away" },
      { name: "KMC Fire Backup", phone: "9847222334", description: "9.0 km away" },
    ],
  },
  {
    localGovName: "Kageshwori Manahora",
    department: "police",
    contacts: [
      { name: "Kageshwori Police Station", phone: "9847333445", description: "1.5 km away" },
      { name: "Traffic Police Kageshwori", phone: "9847444556", description: "3.0 km away" },
      { name: "Area Police Office Kageshwori", phone: "9847555667", description: "5.0 km away" },
    ],
  },
  {
    localGovName: "Kageshwori Manahora",
    department: "flood",
    contacts: [
      { name: "Kageshwori Flood Rescue", phone: "9847666778", description: "2.5 km away" },
      { name: "Manohara River Rescue", phone: "9847777889", description: "5.0 km away" },
      { name: "Disaster Response Kageshwori", phone: "9847888990", description: "7.0 km away" },
    ],
  },
  {
    localGovName: "Kageshwori Manahora",
    department: "accident",
    contacts: [
      { name: "Traffic Emergency Kageshwori", phone: "9858000112", description: "2.0 km away" },
      { name: "Road Safety Kageshwori", phone: "9858111223", description: "4.5 km away" },
      { name: "Emergency Ambulance Kageshwori", phone: "9858222334", description: "7.0 km away" },
    ],
  },
  {
    localGovName: "Kageshwori Manahora",
    department: "landslide",
    contacts: [
      { name: "Landslide Rescue Kageshwori", phone: "9858333445", description: "3.5 km away" },
      { name: "Hill Response Kageshwori", phone: "9858444556", description: "6.0 km away" },
      { name: "Kageshwori Disaster Control", phone: "9858555667", description: "8.0 km away" },
    ],
  },
  {
    localGovName: "Kageshwori Manahora",
    department: "other",
    contacts: [
      { name: "Animal Control Kageshwori", phone: "9858666778", description: "2.0 km away" },
      { name: "Gas Leak Response Kageshwori", phone: "9858777889", description: "4.5 km away" },
      { name: "Misc Emergency Kageshwori", phone: "9858888990", description: "7.0 km away" },
    ],
  },

  // ===== KIRTIPUR =====
  {
    localGovName: "Kirtipur",
    department: "fire",
    contacts: [
      { name: "Kirtipur Fire Post", phone: "9849000112", description: "1.5 km away" },
      { name: "Kirtipur Municipal Fire", phone: "9849111223", description: "3.0 km away" },
      { name: "KMC Fire Backup", phone: "9849222334", description: "7.0 km away" },
    ],
  },
  {
    localGovName: "Kirtipur",
    department: "police",
    contacts: [
      { name: "Kirtipur Police Station", phone: "9849333445", description: "1.0 km away" },
      { name: "Traffic Police Kirtipur", phone: "9849444556", description: "2.5 km away" },
      { name: "Area Police Office Kirtipur", phone: "9849555667", description: "4.0 km away" },
    ],
  },
  {
    localGovName: "Kirtipur",
    department: "flood",
    contacts: [
      { name: "Kirtipur Flood Rescue", phone: "9849666778", description: "2.0 km away" },
      { name: "Bishnumati River Rescue", phone: "9849777889", description: "4.5 km away" },
      { name: "Disaster Response Kirtipur", phone: "9849888990", description: "6.0 km away" },
    ],
  },
  {
    localGovName: "Kirtipur",
    department: "accident",
    contacts: [
      { name: "Traffic Emergency Kirtipur", phone: "9859000112", description: "2.0 km away" },
      { name: "Road Safety Kirtipur", phone: "9859111223", description: "4.0 km away" },
      { name: "Emergency Ambulance Kirtipur", phone: "9859222334", description: "6.0 km away" },
    ],
  },
  {
    localGovName: "Kirtipur",
    department: "landslide",
    contacts: [
      { name: "Landslide Rescue Kirtipur", phone: "9859333445", description: "3.0 km away" },
      { name: "Hill Slope Response Kirtipur", phone: "9859444556", description: "5.5 km away" },
      { name: "Kirtipur Disaster Control", phone: "9859555667", description: "7.5 km away" },
    ],
  },
  {
    localGovName: "Kirtipur",
    department: "other",
    contacts: [
      { name: "Animal Control Kirtipur", phone: "9859666778", description: "1.5 km away" },
      { name: "Gas Leak Response Kirtipur", phone: "9859777889", description: "3.5 km away" },
      { name: "Misc Emergency Kirtipur", phone: "9859888990", description: "6.5 km away" },
    ],
  },

  // ===== NAGARJUN =====
  {
    localGovName: "Nagarjun",
    department: "fire",
    contacts: [
      { name: "Nagarjun Fire Post", phone: "9819000112", description: "2.0 km away" },
      { name: "Sitapaila Fire Service", phone: "9819111223", description: "4.5 km away" },
      { name: "KMC Fire Backup", phone: "9819222334", description: "8.0 km away" },
    ],
  },
  {
    localGovName: "Nagarjun",
    department: "police",
    contacts: [
      { name: "Sitapaila Police Station", phone: "9819333445", description: "1.5 km away" },
      { name: "Nagarjun Area Police", phone: "9819444556", description: "3.0 km away" },
      { name: "Traffic Police Nagarjun", phone: "9819555667", description: "5.0 km away" },
    ],
  },
  {
    localGovName: "Nagarjun",
    department: "flood",
    contacts: [
      { name: "Nagarjun Flood Rescue", phone: "9819666778", description: "2.5 km away" },
      { name: "Bishnumati Flood Response", phone: "9819777889", description: "5.0 km away" },
      { name: "Disaster Response Nagarjun", phone: "9819888990", description: "7.0 km away" },
    ],
  },
  {
    localGovName: "Nagarjun",
    department: "accident",
    contacts: [
      { name: "Traffic Emergency Nagarjun", phone: "9819000113", description: "2.0 km away" },
      { name: "Road Safety Sitapaila", phone: "9819111224", description: "4.5 km away" },
      { name: "Emergency Ambulance Nagarjun", phone: "9819222335", description: "6.5 km away" },
    ],
  },
  {
    localGovName: "Nagarjun",
    department: "landslide",
    contacts: [
      { name: "Landslide Rescue Nagarjun", phone: "9819333446", description: "3.5 km away" },
      { name: "Hill Slope Response Sitapaila", phone: "9819444557", description: "6.0 km away" },
      { name: "Nagarjun Disaster Control", phone: "9819555668", description: "8.0 km away" },
    ],
  },
  {
    localGovName: "Nagarjun",
    department: "other",
    contacts: [
      { name: "Animal Control Nagarjun", phone: "9819666779", description: "2.0 km away" },
      { name: "Gas Leak Response Sitapaila", phone: "9819777880", description: "4.5 km away" },
      { name: "Misc Emergency Nagarjun", phone: "9819888991", description: "7.0 km away" },
    ],
  },

  // ===== SHANKHARAPUR =====
  {
    localGovName: "Shankharapur",
    department: "fire",
    contacts: [
      { name: "Shankharapur Fire Post", phone: "9822000112", description: "2.0 km away" },
      { name: "Sankhu Fire Service", phone: "9822111223", description: "4.0 km away" },
      { name: "KMC Fire Backup", phone: "9822222334", description: "10.0 km away" },
    ],
  },
  {
    localGovName: "Shankharapur",
    department: "police",
    contacts: [
      { name: "Sankhu Police Station", phone: "9822333445", description: "1.5 km away" },
      { name: "Shankharapur Area Police", phone: "9822444556", description: "3.0 km away" },
      { name: "Traffic Police Shankharapur", phone: "9822555667", description: "5.0 km away" },
    ],
  },
  {
    localGovName: "Shankharapur",
    department: "flood",
    contacts: [
      { name: "Shankharapur Flood Rescue", phone: "9822666778", description: "2.5 km away" },
      { name: "Manohara River Rescue", phone: "9822777889", description: "5.0 km away" },
      { name: "Disaster Response Shankharapur", phone: "9822888990", description: "7.5 km away" },
    ],
  },
  {
    localGovName: "Shankharapur",
    department: "accident",
    contacts: [
      { name: "Traffic Emergency Sankhu", phone: "9822000113", description: "2.0 km away" },
      { name: "Road Safety Shankharapur", phone: "9822111224", description: "4.5 km away" },
      { name: "Emergency Ambulance Sankhu", phone: "9822222335", description: "7.0 km away" },
    ],
  },
  {
    localGovName: "Shankharapur",
    department: "landslide",
    contacts: [
      { name: "Landslide Rescue Shankharapur", phone: "9822333446", description: "3.5 km away" },
      { name: "Hill Response Sankhu", phone: "9822444557", description: "6.0 km away" },
      { name: "Shankharapur Disaster Control", phone: "9822555668", description: "8.5 km away" },
    ],
  },
  {
    localGovName: "Shankharapur",
    department: "other",
    contacts: [
      { name: "Animal Control Shankharapur", phone: "9822666779", description: "2.0 km away" },
      { name: "Gas Leak Response Sankhu", phone: "9822777880", description: "4.5 km away" },
      { name: "Misc Emergency Shankharapur", phone: "9822888991", description: "7.0 km away" },
    ],
  },

  // ===== TARAKESHWOR =====
  {
    localGovName: "Tarakeshwor",
    department: "fire",
    contacts: [
      { name: "Tarakeshwor Fire Post", phone: "9823000112", description: "2.0 km away" },
      { name: "Tokha Fire Service", phone: "9823111223", description: "4.0 km away" },
      { name: "KMC Fire Backup", phone: "9823222334", description: "8.0 km away" },
    ],
  },
  {
    localGovName: "Tarakeshwor",
    department: "police",
    contacts: [
      { name: "Tarakeshwor Police Station", phone: "9823333445", description: "1.5 km away" },
      { name: "Traffic Police Tarakeshwor", phone: "9823444556", description: "3.0 km away" },
      { name: "Area Police Office Tarakeshwor", phone: "9823555667", description: "5.0 km away" },
    ],
  },
  {
    localGovName: "Tarakeshwor",
    department: "flood",
    contacts: [
      { name: "Tarakeshwor Flood Rescue", phone: "9823666778", description: "2.5 km away" },
      { name: "Bishnumati River Rescue", phone: "9823777889", description: "5.0 km away" },
      { name: "Disaster Response Tarakeshwor", phone: "9823888990", description: "7.0 km away" },
    ],
  },
  {
    localGovName: "Tarakeshwor",
    department: "accident",
    contacts: [
      { name: "Traffic Emergency Tarakeshwor", phone: "9823000113", description: "2.0 km away" },
      { name: "Road Safety Tarakeshwor", phone: "9823111224", description: "4.5 km away" },
      { name: "Emergency Ambulance Tarakeshwor", phone: "9823222335", description: "6.5 km away" },
    ],
  },
  {
    localGovName: "Tarakeshwor",
    department: "landslide",
    contacts: [
      { name: "Landslide Rescue Tarakeshwor", phone: "9823333446", description: "3.5 km away" },
      { name: "Hill Slope Response Tarakeshwor", phone: "9823444557", description: "6.0 km away" },
      { name: "Tarakeshwor Disaster Control", phone: "9823555668", description: "8.0 km away" },
    ],
  },
  {
    localGovName: "Tarakeshwor",
    department: "other",
    contacts: [
      { name: "Animal Control Tarakeshwor", phone: "9823666779", description: "2.0 km away" },
      { name: "Gas Leak Response Tarakeshwor", phone: "9823777880", description: "4.5 km away" },
      { name: "Misc Emergency Tarakeshwor", phone: "9823888991", description: "7.0 km away" },
    ],
  },

  // ===== TOKHA =====
  {
    localGovName: "Tokha",
    department: "fire",
    contacts: [
      { name: "Tokha Fire Post", phone: "9824000112", description: "1.5 km away" },
      { name: "Tokha Municipal Fire", phone: "9824111223", description: "3.0 km away" },
      { name: "KMC Fire Backup", phone: "9824222334", description: "7.0 km away" },
    ],
  },
  {
    localGovName: "Tokha",
    department: "police",
    contacts: [
      { name: "Tokha Police Station", phone: "9824333445", description: "1.0 km away" },
      { name: "Traffic Police Tokha", phone: "9824444556", description: "2.5 km away" },
      { name: "Area Police Office Tokha", phone: "9824555667", description: "4.5 km away" },
    ],
  },
  {
    localGovName: "Tokha",
    department: "flood",
    contacts: [
      { name: "Tokha Flood Rescue", phone: "9824666778", description: "2.0 km away" },
      { name: "Bishnumati Flood Response", phone: "9824777889", description: "4.5 km away" },
      { name: "Disaster Response Tokha", phone: "9824888990", description: "6.5 km away" },
    ],
  },
  {
    localGovName: "Tokha",
    department: "accident",
    contacts: [
      { name: "Traffic Emergency Tokha", phone: "9824000113", description: "2.0 km away" },
      { name: "Road Safety Tokha", phone: "9824111224", description: "4.0 km away" },
      { name: "Emergency Ambulance Tokha", phone: "9824222335", description: "6.0 km away" },
    ],
  },
  {
    localGovName: "Tokha",
    department: "landslide",
    contacts: [
      { name: "Landslide Rescue Tokha", phone: "9824333446", description: "3.0 km away" },
      { name: "Hill Slope Response Tokha", phone: "9824444557", description: "5.5 km away" },
      { name: "Tokha Disaster Control", phone: "9824555668", description: "7.5 km away" },
    ],
  },
  {
    localGovName: "Tokha",
    department: "other",
    contacts: [
      { name: "Animal Control Tokha", phone: "9824666779", description: "1.5 km away" },
      { name: "Gas Leak Response Tokha", phone: "9824777880", description: "4.0 km away" },
      { name: "Misc Emergency Tokha", phone: "9824888991", description: "6.5 km away" },
    ],
  },

  // =====================================================================
  // KATHMANDU VALLEY — Bhaktapur District
  // =====================================================================

  // ===== BHAKTAPUR =====
  {
    localGovName: "Bhaktapur",
    department: "fire",
    contacts: [
      { name: "Bhaktapur Fire Brigade", phone: "9845123123", description: "1.5 km away" },
      { name: "Bhaktapur Municipal Fire", phone: "9845234234", description: "3.0 km away" },
      { name: "Bhaktapur Emergency Rescue", phone: "9845345345", description: "5.0 km away" },
    ],
  },
  {
    localGovName: "Bhaktapur",
    department: "police",
    contacts: [
      { name: "Bhaktapur Police Station", phone: "9845456456", description: "1.0 km away" },
      { name: "Traffic Police Bhaktapur", phone: "9845567567", description: "2.5 km away" },
      { name: "Area Police Office Bhaktapur", phone: "9845678678", description: "4.0 km away" },
    ],
  },
  {
    localGovName: "Bhaktapur",
    department: "flood",
    contacts: [
      { name: "Bhaktapur Flood Rescue", phone: "9845789789", description: "2.0 km away" },
      { name: "Hanumante River Rescue", phone: "9845890890", description: "4.5 km away" },
      { name: "Disaster Response Bhaktapur", phone: "9845901901", description: "6.5 km away" },
    ],
  },
  {
    localGovName: "Bhaktapur",
    department: "accident",
    contacts: [
      { name: "Traffic Emergency Bhaktapur", phone: "9856123123", description: "2.0 km away" },
      { name: "Road Safety Bhaktapur", phone: "9856234234", description: "4.0 km away" },
      { name: "Emergency Ambulance Bhaktapur", phone: "9856345345", description: "6.0 km away" },
    ],
  },
  {
    localGovName: "Bhaktapur",
    department: "landslide",
    contacts: [
      { name: "Landslide Rescue Bhaktapur", phone: "9856456456", description: "3.0 km away" },
      { name: "Heritage Emergency Response", phone: "9856567567", description: "5.5 km away" },
      { name: "Bhaktapur Disaster Control", phone: "9856678678", description: "7.5 km away" },
    ],
  },
  {
    localGovName: "Bhaktapur",
    department: "other",
    contacts: [
      { name: "Animal Control Bhaktapur", phone: "9856789789", description: "1.5 km away" },
      { name: "Gas Leak Response Bhaktapur", phone: "9856890890", description: "4.0 km away" },
      { name: "Misc Emergency Bhaktapur", phone: "9856901901", description: "6.5 km away" },
    ],
  },

  // ===== CHANGUNARAYAN =====
  {
    localGovName: "Changunarayan",
    department: "fire",
    contacts: [
      { name: "Changunarayan Fire Post", phone: "9825100112", description: "2.0 km away" },
      { name: "Bhaktapur Fire Backup", phone: "9825111223", description: "5.0 km away" },
      { name: "Changunarayan Rescue", phone: "9825122334", description: "7.0 km away" },
    ],
  },
  {
    localGovName: "Changunarayan",
    department: "police",
    contacts: [
      { name: "Changunarayan Police Station", phone: "9825133445", description: "1.5 km away" },
      { name: "Traffic Police Changunarayan", phone: "9825144556", description: "3.0 km away" },
      { name: "Area Police Changunarayan", phone: "9825155667", description: "5.0 km away" },
    ],
  },
  {
    localGovName: "Changunarayan",
    department: "flood",
    contacts: [
      { name: "Changunarayan Flood Rescue", phone: "9825166778", description: "2.5 km away" },
      { name: "Hanumante River Response", phone: "9825177889", description: "5.0 km away" },
      { name: "Disaster Response Changunarayan", phone: "9825188990", description: "7.0 km away" },
    ],
  },
  {
    localGovName: "Changunarayan",
    department: "accident",
    contacts: [
      { name: "Traffic Emergency Changunarayan", phone: "9825100113", description: "2.0 km away" },
      { name: "Road Safety Changunarayan", phone: "9825111224", description: "4.5 km away" },
      { name: "Emergency Ambulance Changunarayan", phone: "9825122335", description: "6.5 km away" },
    ],
  },
  {
    localGovName: "Changunarayan",
    department: "landslide",
    contacts: [
      { name: "Landslide Rescue Changunarayan", phone: "9825133446", description: "3.5 km away" },
      { name: "Hill Response Changunarayan", phone: "9825144557", description: "6.0 km away" },
      { name: "Changunarayan Disaster Control", phone: "9825155668", description: "8.0 km away" },
    ],
  },
  {
    localGovName: "Changunarayan",
    department: "other",
    contacts: [
      { name: "Animal Control Changunarayan", phone: "9825166779", description: "2.0 km away" },
      { name: "Gas Leak Response Changunarayan", phone: "9825177880", description: "4.5 km away" },
      { name: "Misc Emergency Changunarayan", phone: "9825188991", description: "7.0 km away" },
    ],
  },

  // ===== MADHYAPUR THIMI =====
  {
    localGovName: "Madhyapur Thimi",
    department: "fire",
    contacts: [
      { name: "Thimi Fire Post", phone: "9826100112", description: "1.5 km away" },
      { name: "Madhyapur Fire Service", phone: "9826111223", description: "3.0 km away" },
      { name: "Bhaktapur Fire Backup", phone: "9826122334", description: "6.0 km away" },
    ],
  },
  {
    localGovName: "Madhyapur Thimi",
    department: "police",
    contacts: [
      { name: "Thimi Police Station", phone: "9826133445", description: "1.0 km away" },
      { name: "Traffic Police Madhyapur", phone: "9826144556", description: "2.5 km away" },
      { name: "Area Police Thimi", phone: "9826155667", description: "4.5 km away" },
    ],
  },
  {
    localGovName: "Madhyapur Thimi",
    department: "flood",
    contacts: [
      { name: "Madhyapur Flood Rescue", phone: "9826166778", description: "2.0 km away" },
      { name: "Hanumante River Rescue", phone: "9826177889", description: "4.5 km away" },
      { name: "Disaster Response Madhyapur", phone: "9826188990", description: "6.5 km away" },
    ],
  },
  {
    localGovName: "Madhyapur Thimi",
    department: "accident",
    contacts: [
      { name: "Traffic Emergency Thimi", phone: "9826100113", description: "2.0 km away" },
      { name: "Road Safety Madhyapur", phone: "9826111224", description: "4.0 km away" },
      { name: "Emergency Ambulance Thimi", phone: "9826122335", description: "6.0 km away" },
    ],
  },
  {
    localGovName: "Madhyapur Thimi",
    department: "landslide",
    contacts: [
      { name: "Landslide Rescue Madhyapur", phone: "9826133446", description: "3.0 km away" },
      { name: "Hill Response Thimi", phone: "9826144557", description: "5.5 km away" },
      { name: "Madhyapur Disaster Control", phone: "9826155668", description: "7.5 km away" },
    ],
  },
  {
    localGovName: "Madhyapur Thimi",
    department: "other",
    contacts: [
      { name: "Animal Control Madhyapur", phone: "9826166779", description: "1.5 km away" },
      { name: "Gas Leak Response Thimi", phone: "9826177880", description: "4.0 km away" },
      { name: "Misc Emergency Madhyapur", phone: "9826188991", description: "6.5 km away" },
    ],
  },

  // ===== SURYABINAYAK =====
  {
    localGovName: "Suryabinayak",
    department: "fire",
    contacts: [
      { name: "Suryabinayak Fire Post", phone: "9827100112", description: "2.0 km away" },
      { name: "Bhaktapur Fire Backup", phone: "9827111223", description: "4.5 km away" },
      { name: "Suryabinayak Rescue", phone: "9827122334", description: "6.0 km away" },
    ],
  },
  {
    localGovName: "Suryabinayak",
    department: "police",
    contacts: [
      { name: "Suryabinayak Police Station", phone: "9827133445", description: "1.5 km away" },
      { name: "Traffic Police Suryabinayak", phone: "9827144556", description: "3.0 km away" },
      { name: "Area Police Suryabinayak", phone: "9827155667", description: "5.0 km away" },
    ],
  },
  {
    localGovName: "Suryabinayak",
    department: "flood",
    contacts: [
      { name: "Suryabinayak Flood Rescue", phone: "9827166778", description: "2.5 km away" },
      { name: "Hanumante River Rescue", phone: "9827177889", description: "5.0 km away" },
      { name: "Disaster Response Suryabinayak", phone: "9827188990", description: "7.0 km away" },
    ],
  },
  {
    localGovName: "Suryabinayak",
    department: "accident",
    contacts: [
      { name: "Traffic Emergency Suryabinayak", phone: "9827100113", description: "2.0 km away" },
      { name: "Road Safety Suryabinayak", phone: "9827111224", description: "4.5 km away" },
      { name: "Emergency Ambulance Suryabinayak", phone: "9827122335", description: "6.5 km away" },
    ],
  },
  {
    localGovName: "Suryabinayak",
    department: "landslide",
    contacts: [
      { name: "Landslide Rescue Suryabinayak", phone: "9827133446", description: "3.5 km away" },
      { name: "Hill Response Suryabinayak", phone: "9827144557", description: "6.0 km away" },
      { name: "Suryabinayak Disaster Control", phone: "9827155668", description: "8.0 km away" },
    ],
  },
  {
    localGovName: "Suryabinayak",
    department: "other",
    contacts: [
      { name: "Animal Control Suryabinayak", phone: "9827166779", description: "2.0 km away" },
      { name: "Gas Leak Response Suryabinayak", phone: "9827177880", description: "4.5 km away" },
      { name: "Misc Emergency Suryabinayak", phone: "9827188991", description: "7.0 km away" },
    ],
  },

  // =====================================================================
  // KATHMANDU VALLEY — Lalitpur District
  // =====================================================================

  // ===== LALITPUR =====
  {
    localGovName: "Lalitpur",
    department: "fire",
    contacts: [
      { name: "Lalitpur Fire Brigade", phone: "9848123123", description: "1.5 km away" },
      { name: "Lalitpur Metro Fire Station", phone: "9848234234", description: "3.0 km away" },
      { name: "Patan Emergency Rescue", phone: "9848345345", description: "5.0 km away" },
    ],
  },
  {
    localGovName: "Lalitpur",
    department: "police",
    contacts: [
      { name: "Lalitpur Police Station", phone: "9848456456", description: "1.0 km away" },
      { name: "Traffic Police Lalitpur", phone: "9848567567", description: "2.5 km away" },
      { name: "Metropolitan Police Patan", phone: "9848678678", description: "4.0 km away" },
    ],
  },
  {
    localGovName: "Lalitpur",
    department: "flood",
    contacts: [
      { name: "Lalitpur Flood Rescue", phone: "9848789789", description: "2.0 km away" },
      { name: "Bagmati River Rescue Patan", phone: "9848890890", description: "4.5 km away" },
      { name: "Disaster Response Lalitpur", phone: "9848901901", description: "6.0 km away" },
    ],
  },
  {
    localGovName: "Lalitpur",
    department: "accident",
    contacts: [
      { name: "Traffic Emergency Lalitpur", phone: "9857123123", description: "2.0 km away" },
      { name: "Road Safety Lalitpur", phone: "9857234234", description: "4.0 km away" },
      { name: "Emergency Ambulance Lalitpur", phone: "9857345345", description: "6.0 km away" },
    ],
  },
  {
    localGovName: "Lalitpur",
    department: "landslide",
    contacts: [
      { name: "Landslide Rescue Lalitpur", phone: "9857456456", description: "3.0 km away" },
      { name: "Hill Response Patan", phone: "9857567567", description: "5.5 km away" },
      { name: "Lalitpur Disaster Control", phone: "9857678678", description: "7.5 km away" },
    ],
  },
  {
    localGovName: "Lalitpur",
    department: "other",
    contacts: [
      { name: "Animal Control Lalitpur", phone: "9857789789", description: "1.5 km away" },
      { name: "Gas Leak Response Patan", phone: "9857890890", description: "4.0 km away" },
      { name: "Misc Emergency Lalitpur", phone: "9857901901", description: "6.5 km away" },
    ],
  },

  // ===== GODAWARI =====
  {
    localGovName: "Godawari",
    department: "fire",
    contacts: [
      { name: "Godawari Fire Post", phone: "9828100112", description: "2.0 km away" },
      { name: "Lalitpur Metro Fire Backup", phone: "9828111223", description: "6.0 km away" },
      { name: "Godawari Rescue Team", phone: "9828122334", description: "8.0 km away" },
    ],
  },
  {
    localGovName: "Godawari",
    department: "police",
    contacts: [
      { name: "Godawari Police Station", phone: "9828133445", description: "1.5 km away" },
      { name: "Traffic Police Godawari", phone: "9828144556", description: "3.0 km away" },
      { name: "Area Police Godawari", phone: "9828155667", description: "5.0 km away" },
    ],
  },
  {
    localGovName: "Godawari",
    department: "flood",
    contacts: [
      { name: "Godawari Flood Rescue", phone: "9828166778", description: "2.5 km away" },
      { name: "Bagmati River Response", phone: "9828177889", description: "5.0 km away" },
      { name: "Disaster Response Godawari", phone: "9828188990", description: "7.5 km away" },
    ],
  },
  {
    localGovName: "Godawari",
    department: "accident",
    contacts: [
      { name: "Traffic Emergency Godawari", phone: "9828100113", description: "2.0 km away" },
      { name: "Road Safety Godawari", phone: "9828111224", description: "4.5 km away" },
      { name: "Emergency Ambulance Godawari", phone: "9828122335", description: "7.0 km away" },
    ],
  },
  {
    localGovName: "Godawari",
    department: "landslide",
    contacts: [
      { name: "Landslide Rescue Godawari", phone: "9828133446", description: "3.5 km away" },
      { name: "Hill Response Godawari", phone: "9828144557", description: "6.0 km away" },
      { name: "Godawari Disaster Control", phone: "9828155668", description: "8.5 km away" },
    ],
  },
  {
    localGovName: "Godawari",
    department: "other",
    contacts: [
      { name: "Animal Control Godawari", phone: "9828166779", description: "2.0 km away" },
      { name: "Gas Leak Response Godawari", phone: "9828177880", description: "4.5 km away" },
      { name: "Misc Emergency Godawari", phone: "9828188991", description: "7.0 km away" },
    ],
  },

  // ===== MAHALAXMI =====
  {
    localGovName: "Mahalaxmi",
    department: "fire",
    contacts: [
      { name: "Mahalaxmi Fire Post", phone: "9829100112", description: "2.0 km away" },
      { name: "Lalitpur Fire Backup", phone: "9829111223", description: "5.0 km away" },
      { name: "Mahalaxmi Rescue", phone: "9829122334", description: "7.0 km away" },
    ],
  },
  {
    localGovName: "Mahalaxmi",
    department: "police",
    contacts: [
      { name: "Mahalaxmi Police Station", phone: "9829133445", description: "1.5 km away" },
      { name: "Traffic Police Mahalaxmi", phone: "9829144556", description: "3.0 km away" },
      { name: "Area Police Mahalaxmi", phone: "9829155667", description: "5.0 km away" },
    ],
  },
  {
    localGovName: "Mahalaxmi",
    department: "flood",
    contacts: [
      { name: "Mahalaxmi Flood Rescue", phone: "9829166778", description: "2.5 km away" },
      { name: "Bagmati River Rescue", phone: "9829177889", description: "5.0 km away" },
      { name: "Disaster Response Mahalaxmi", phone: "9829188990", description: "7.0 km away" },
    ],
  },
  {
    localGovName: "Mahalaxmi",
    department: "accident",
    contacts: [
      { name: "Traffic Emergency Mahalaxmi", phone: "9829100113", description: "2.0 km away" },
      { name: "Road Safety Mahalaxmi", phone: "9829111224", description: "4.5 km away" },
      { name: "Emergency Ambulance Mahalaxmi", phone: "9829122335", description: "6.5 km away" },
    ],
  },
  {
    localGovName: "Mahalaxmi",
    department: "landslide",
    contacts: [
      { name: "Landslide Rescue Mahalaxmi", phone: "9829133446", description: "3.5 km away" },
      { name: "Hill Response Mahalaxmi", phone: "9829144557", description: "6.0 km away" },
      { name: "Mahalaxmi Disaster Control", phone: "9829155668", description: "8.0 km away" },
    ],
  },
  {
    localGovName: "Mahalaxmi",
    department: "other",
    contacts: [
      { name: "Animal Control Mahalaxmi", phone: "9829166779", description: "2.0 km away" },
      { name: "Gas Leak Response Mahalaxmi", phone: "9829177880", description: "4.5 km away" },
      { name: "Misc Emergency Mahalaxmi", phone: "9829188991", description: "7.0 km away" },
    ],
  },

  // ===== BAGMATI (Gaunpalika) =====
  {
    localGovName: "Bagmati",
    department: "fire",
    contacts: [
      { name: "Bagmati Gaunpalika Fire Post", phone: "9830100112", description: "2.5 km away" },
      { name: "Lalitpur Fire Backup", phone: "9830111223", description: "7.0 km away" },
      { name: "Bagmati Rescue Team", phone: "9830122334", description: "9.0 km away" },
    ],
  },
  {
    localGovName: "Bagmati",
    department: "police",
    contacts: [
      { name: "Bagmati Area Police", phone: "9830133445", description: "2.0 km away" },
      { name: "Traffic Police Bagmati", phone: "9830144556", description: "4.0 km away" },
      { name: "Rural Police Post Bagmati", phone: "9830155667", description: "6.0 km away" },
    ],
  },
  {
    localGovName: "Bagmati",
    department: "flood",
    contacts: [
      { name: "Bagmati Flood Rescue", phone: "9830166778", description: "3.0 km away" },
      { name: "Bagmati River Flood Response", phone: "9830177889", description: "5.5 km away" },
      { name: "Disaster Response Bagmati GP", phone: "9830188990", description: "8.0 km away" },
    ],
  },
  {
    localGovName: "Bagmati",
    department: "accident",
    contacts: [
      { name: "Traffic Emergency Bagmati", phone: "9830100113", description: "2.5 km away" },
      { name: "Rural Road Safety Bagmati", phone: "9830111224", description: "5.0 km away" },
      { name: "Emergency Ambulance Bagmati", phone: "9830122335", description: "7.5 km away" },
    ],
  },
  {
    localGovName: "Bagmati",
    department: "landslide",
    contacts: [
      { name: "Landslide Rescue Bagmati", phone: "9830133446", description: "4.0 km away" },
      { name: "Hill Response Bagmati", phone: "9830144557", description: "6.5 km away" },
      { name: "Bagmati Disaster Control", phone: "9830155668", description: "9.0 km away" },
    ],
  },
  {
    localGovName: "Bagmati",
    department: "other",
    contacts: [
      { name: "Animal Control Bagmati", phone: "9830166779", description: "2.5 km away" },
      { name: "Gas Leak Response Bagmati", phone: "9830177880", description: "5.0 km away" },
      { name: "Misc Emergency Bagmati", phone: "9830188991", description: "8.0 km away" },
    ],
  },

  // ===== KONJYOSOM (Gaunpalika) =====
  {
    localGovName: "Konjyosom",
    department: "fire",
    contacts: [
      { name: "Konjyosom Fire Post", phone: "9831100112", description: "3.0 km away" },
      { name: "Lalitpur Fire Backup", phone: "9831111223", description: "10.0 km away" },
      { name: "Konjyosom Rescue", phone: "9831122334", description: "12.0 km away" },
    ],
  },
  {
    localGovName: "Konjyosom",
    department: "police",
    contacts: [
      { name: "Konjyosom Area Police", phone: "9831133445", description: "2.0 km away" },
      { name: "Traffic Police Konjyosom", phone: "9831144556", description: "5.0 km away" },
      { name: "Rural Police Post Konjyosom", phone: "9831155667", description: "7.0 km away" },
    ],
  },
  {
    localGovName: "Konjyosom",
    department: "flood",
    contacts: [
      { name: "Konjyosom Flood Rescue", phone: "9831166778", description: "3.5 km away" },
      { name: "Local River Rescue Team", phone: "9831177889", description: "6.0 km away" },
      { name: "Disaster Response Konjyosom", phone: "9831188990", description: "9.0 km away" },
    ],
  },
  {
    localGovName: "Konjyosom",
    department: "accident",
    contacts: [
      { name: "Traffic Emergency Konjyosom", phone: "9831100113", description: "3.0 km away" },
      { name: "Rural Road Safety Konjyosom", phone: "9831111224", description: "5.5 km away" },
      { name: "Emergency Ambulance Konjyosom", phone: "9831122335", description: "8.0 km away" },
    ],
  },
  {
    localGovName: "Konjyosom",
    department: "landslide",
    contacts: [
      { name: "Landslide Rescue Konjyosom", phone: "9831133446", description: "4.0 km away" },
      { name: "Hill Response Konjyosom", phone: "9831144557", description: "7.0 km away" },
      { name: "Konjyosom Disaster Control", phone: "9831155668", description: "10.0 km away" },
    ],
  },
  {
    localGovName: "Konjyosom",
    department: "other",
    contacts: [
      { name: "Animal Control Konjyosom", phone: "9831166779", description: "3.0 km away" },
      { name: "Gas Leak Response Konjyosom", phone: "9831177880", description: "5.5 km away" },
      { name: "Misc Emergency Konjyosom", phone: "9831188991", description: "8.5 km away" },
    ],
  },

  // ===== MAHANKAL (Gaunpalika) =====
  {
    localGovName: "Mahankal",
    department: "fire",
    contacts: [
      { name: "Mahankal Fire Post", phone: "9832100112", description: "2.5 km away" },
      { name: "Lalitpur Fire Backup", phone: "9832111223", description: "9.0 km away" },
      { name: "Mahankal Rescue Team", phone: "9832122334", description: "11.0 km away" },
    ],
  },
  {
    localGovName: "Mahankal",
    department: "police",
    contacts: [
      { name: "Mahankal Area Police", phone: "9832133445", description: "2.0 km away" },
      { name: "Traffic Police Mahankal", phone: "9832144556", description: "4.5 km away" },
      { name: "Rural Police Post Mahankal", phone: "9832155667", description: "6.5 km away" },
    ],
  },
  {
    localGovName: "Mahankal",
    department: "flood",
    contacts: [
      { name: "Mahankal Flood Rescue", phone: "9832166778", description: "3.0 km away" },
      { name: "Local River Response Team", phone: "9832177889", description: "5.5 km away" },
      { name: "Disaster Response Mahankal", phone: "9832188990", description: "8.5 km away" },
    ],
  },
  {
    localGovName: "Mahankal",
    department: "accident",
    contacts: [
      { name: "Traffic Emergency Mahankal", phone: "9832100113", description: "2.5 km away" },
      { name: "Rural Road Safety Mahankal", phone: "9832111224", description: "5.0 km away" },
      { name: "Emergency Ambulance Mahankal", phone: "9832122335", description: "7.5 km away" },
    ],
  },
  {
    localGovName: "Mahankal",
    department: "landslide",
    contacts: [
      { name: "Landslide Rescue Mahankal", phone: "9832133446", description: "4.0 km away" },
      { name: "Hill Response Mahankal", phone: "9832144557", description: "6.5 km away" },
      { name: "Mahankal Disaster Control", phone: "9832155668", description: "9.0 km away" },
    ],
  },
  {
    localGovName: "Mahankal",
    department: "other",
    contacts: [
      { name: "Animal Control Mahankal", phone: "9832166779", description: "2.5 km away" },
      { name: "Gas Leak Response Mahankal", phone: "9832177880", description: "5.0 km away" },
      { name: "Misc Emergency Mahankal", phone: "9832188991", description: "8.0 km away" },
    ],
  },
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    // Clear existing contact data
    await ContactInfo.deleteMany({});
    console.log("Cleared existing contact data.");

    // Insert seed data
    const result = await ContactInfo.insertMany(seedData);
    console.log(`✅ Seeded ${result.length} contact records successfully!`);
  } catch (err) {
    console.error("❌ Seed failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seed();
