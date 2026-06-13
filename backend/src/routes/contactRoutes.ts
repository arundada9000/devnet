import { Router } from "express";
import {
  getContacts,
  getAllContacts,
  createContact,
  updateContact,
  deleteContact,
} from "../controllers/contactController";

const router = Router();

// GET /api/contacts — list all
router.get("/", getAllContacts);

// GET /api/contacts/:localGov/:department — get specific
router.get("/:localGov/:department", getContacts);

// POST /api/contacts — create new
router.post("/", createContact);

// PUT /api/contacts/:id — update
router.put("/:id", updateContact);

// DELETE /api/contacts/:id — delete
router.delete("/:id", deleteContact);

export default router;
