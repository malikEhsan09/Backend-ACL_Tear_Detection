import express from "express";
import {
  getAllFeedbacks,
  getFeedbacksBySentiment,
  deleteFeedbackById,
  submitFeedback,
} from "../controllers/feedback.controller.js";
import {
  isAdmin,
  isAdminOrPlayer,
  verifyToken,
} from "../middleware/auth.mw.js";

const router = express.Router();

// Create a new feedback (Player only)
router.post("/", verifyToken, submitFeedback);

// Get all feedbacks (Admin only)
router.get("/", verifyToken, getAllFeedbacks);

// Get feedbacks by sentiment (Admin only)
router.get(
  "/sentiment/:sentiment",
  verifyToken,
  isAdmin,
  getFeedbacksBySentiment
);

// Delete feedback by ID (Admin only)
router.delete("/:id", verifyToken, isAdmin, deleteFeedbackById);

export default router;
