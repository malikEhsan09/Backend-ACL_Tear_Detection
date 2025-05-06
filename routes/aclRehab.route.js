import express from "express";
import {
  deleteAclRehabExercise,
  getAllRehabExercisesForAdmin,
  getExercisesBasedOnInjury,
  updateAclRehabExercise,
  uploadAclRehabExercises,
} from "../controllers/aclRehab.controller.js";
import { isAdmin, verifyToken } from "../middleware/auth.mw.js";
import { upload } from "../middleware/multerStorage.js";
const router = express.Router();

// Fetch all ACL rehab exercises
router.get("/exercises/:injuryType", getExercisesBasedOnInjury);

router.post(
  "/exercises",
  verifyToken,
  isAdmin,
  upload.single("imageSrc"),
  uploadAclRehabExercises
);

router.get("/", verifyToken, isAdmin, getAllRehabExercisesForAdmin);

router.put(
  "/exercises/:id",
  verifyToken,
  isAdmin,
  upload.single("imageSrc"),
  updateAclRehabExercise
);

// Admin can delete exercises
router.delete("/exercises/:id", verifyToken, isAdmin, deleteAclRehabExercise);
export default router;
