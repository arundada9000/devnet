import { Request, Response } from "express";
import ContactInfo from "../models/contactModel";

export const getContacts = async (req: Request, res: Response) => {
  try {
    const { localGov, department } = req.params;

    const contactInfo = await ContactInfo.findOne({
      localGovName: new RegExp(`^${localGov}$`, "i"),
      department: new RegExp(`^${department}$`, "i"),
    });

    if (!contactInfo) {
      res.status(404).json({ message: "Contact information not found for this department." });
      return;
    }

    res.status(200).json(contactInfo);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: "Server error while fetching contacts." });
  }
};

export const getAllContacts = async (_req: Request, res: Response) => {
  try {
    const contacts = await ContactInfo.find().sort({ localGovName: 1, department: 1 });
    res.status(200).json(contacts);
  } catch (error) {
    console.error("Error fetching all contacts:", error);
    res.status(500).json({ message: "Server error while fetching contacts." });
  }
};

export const createContact = async (req: Request, res: Response) => {
  try {
    const { localGovName, department, contacts } = req.body;

    if (!localGovName || !department) {
      res.status(400).json({ message: "localGovName and department are required." });
      return;
    }

    const existing = await ContactInfo.findOne({
      localGovName: new RegExp(`^${localGovName}$`, "i"),
      department: new RegExp(`^${department}$`, "i"),
    });

    if (existing) {
      res.status(409).json({ message: "Contact record already exists for this location/department. Use PUT to update." });
      return;
    }

    const newContact = await ContactInfo.create({ localGovName, department, contacts: contacts || [] });
    res.status(201).json(newContact);
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({ message: "Server error while creating contact." });
  }
};

export const updateContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { localGovName, department, contacts } = req.body;

    const updated = await ContactInfo.findByIdAndUpdate(
      id,
      { localGovName, department, contacts },
      { new: true, runValidators: true }
    );

    if (!updated) {
      res.status(404).json({ message: "Contact record not found." });
      return;
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).json({ message: "Server error while updating contact." });
  }
};

export const deleteContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await ContactInfo.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ message: "Contact record not found." });
      return;
    }

    res.status(200).json({ message: "Contact record deleted successfully." });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ message: "Server error while deleting contact." });
  }
};
