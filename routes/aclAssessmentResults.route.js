import express from "express";
import { verifyToken } from "../middleware/auth.mw.js";
import { getAllAssessmentResults, getRecommendedExercises } from "../controllers/aclAssessmentResult.controller.js";

const router = express.Router();

router.get("/", verifyToken, getAllAssessmentResults);
router.get("/player/exercises", verifyToken, getRecommendedExercises);

export default router;
