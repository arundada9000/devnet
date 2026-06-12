import { Router } from "express";
import {
  getContacts,
  getAllContacts,
  createContact,
  updateContact,
  deleteContact,
} from "../controllers/contactController";

const router = Router();

router.get("/", getAllContacts);
router.get("/:localGov/:department", getContacts);
router.post("/", createContact);
router.put("/:id", updateContact);
router.delete("/:id", deleteContact);

export default router;
