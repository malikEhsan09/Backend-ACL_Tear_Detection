import express from "express";
import {
  deleteClubById,
  getAllClubs,
  submitClubForm,
  updateClubById,
  assignPlayerToClub,
  getClub,
  removePlayerFromClub,
  acceptInvite,
  generateInviteLink,
} from "../controllers/club.controller.js";
import { upload } from "../middleware/multerStorage.js";
import { verifyToken, isAdmin } from "../middleware/auth.mw.js";

const router = express.Router();

// Submit a club form (only admins)
router.post(
  "/submit",
  verifyToken,
  isAdmin,
  upload.fields([{ name: "clubLogo", maxCount: 1 }]),
  submitClubForm
);

// Get all club forms
router.get("/", verifyToken, getAllClubs);

// Get a specific club form by ID
router.get("/:id", verifyToken, getClub);

// Update a specific club form by ID (only admins)
router.patch(
  "/:id",
  verifyToken,
  isAdmin,
  upload.fields([{ name: "clubLogo", maxCount: 1 }]),
  updateClubById
);

// Delete a specific club form by ID (only admins)
router.delete("/:id", verifyToken, isAdmin, deleteClubById);

// Assign player to club (only admins)
router.post("/assignPlayer", verifyToken, isAdmin, assignPlayerToClub);

// remove player from the club
router.post("/removePlayer", verifyToken, isAdmin, removePlayerFromClub);

// Generate invite link (only admins)
router.post("/generateInviteLink", verifyToken, isAdmin, generateInviteLink);

// Accept invite link and register player
router.post(
  "/acceptInvite/:token",
  upload.fields([{ name: "image", maxCount: 1 }]),
  acceptInvite
);

export default router;
