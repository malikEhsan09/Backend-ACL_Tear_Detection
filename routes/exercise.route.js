import express from "express";
import {
  createExercise,
  updateExercise,
  deleteExercise,
  assignExerciseToPlayer,
  getAllExercises,
  getExerciseById,
} from "../controllers/exercise.controller.js";
// import { videoUpload } from "../middleware/multerStorage.js";
import { videoUpload } from "../middleware/multerStorage.js";
import { verifyToken, isAdmin } from "../middleware/auth.mw.js";

const router = express.Router();

router.post(
  "/create",
  verifyToken,
  isAdmin,
  videoUpload.fields([
    { name: "partiallyDamages", maxCount: 5 },
    { name: "completelyRuptured", maxCount: 5 },
    { name: "tutorials", maxCount: 5 },
    { name: "partiallyDamagesThumbnail", maxCount: 5 },
    { name: "completelyRupturedThumbnail", maxCount: 5 },
    { name: "tutorialsThumbnail", maxCount: 5 },
  ]),
  createExercise
);

// Update an existing exercise (only admins)
router.patch(
  "/:id",
  verifyToken,
  isAdmin,
  videoUpload.fields([
    { name: "partiallyDamages", maxCount: 5 },
    { name: "completelyRuptured", maxCount: 5 },
    { name: "tutorials", maxCount: 5 },
    { name: "partiallyDamagesThumbnail", maxCount: 5 },
    { name: "completelyRupturedThumbnail", maxCount: 5 },
    { name: "tutorialsThumbnail", maxCount: 5 },
  ]),
  updateExercise
);

// Delete an existing exercise (only admins)
router.delete("/:id", verifyToken, isAdmin, deleteExercise);

// Get all exercises
router.get("/", verifyToken, getAllExercises);

// Get an exercise by ID
router.get("/:id", verifyToken, getExerciseById);

// Assign exercise to player (only admins)
router.post("/assign", verifyToken, assignExerciseToPlayer);

export default router;
