import express from "express";
import { upload } from "../middleware/multerStorage.js";

import {
  bookAppointment,
  createPlayer,
  deletePlayerById,
  getAllPlayers,
  getPlayerAppointments,
  getPlayerById,
  getPlayerReport,
  updatePlayerById,
} from "../controllers/player.controller.js";
import {
  isAdmin,
  isAdminOrPlayer,
  isPlayerOwner,
  verifyToken,
} from "../middleware/auth.mw.js";
// import { verifyToken } from "../verifyToken.js";

const router = express.Router();

router.post(
  "/",
  verifyToken, // Ensure the user is authenticated
  upload.fields([
    { name: "image", maxCount: 1 },
    // { name: "clubLogo", maxCount: 1 },
  ]),
  createPlayer
);

// Get all players 
router.get("/", verifyToken, getAllPlayers);

// Get a single player by ID (only Admins or the Player themselves)
router.get("/:id", verifyToken, getPlayerById);

// Update a player by ID (only the Player themselves)
router.patch(
  "/:id",
  verifyToken,
  // isPlayerOwner, // Ensure the user is the owner
  upload.fields([{ name: "image", maxCount: 1 }]),
  updatePlayerById
);

// Delete a player by ID (only Admins can delete)
router.delete("/:id", verifyToken, isAdmin, deletePlayerById);

// Book an Appointment
router.post("/appointment", bookAppointment);
router.get("/appointments/:playerID", getPlayerAppointments);
router.get("/report/:playerID", getPlayerReport);

export default router;
