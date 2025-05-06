// Controller to get all assessment results
import AclAssessmentResult from "../models/aclAssessmentResults.model.js";
import Player from "../models/player.model.js";
import aclRehabExercise from "../models/aclRehab.model.js";

// Fetch ACL assessment results for the logged-in player
export const getAllAssessmentResults = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch the player's record using the userId from the token
    const player = await Player.findOne({ userID: userId });

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Fetch ACL assessment results associated with this player
    const results = await AclAssessmentResult.find({
      playerId: player._id,
    }).exec();

    if (!results.length) {
      return res
        .status(404)
        .json({ message: "No assessment results found for this player" });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching assessment results:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRecommendedExercises = async (req, res) => {
  try {
    const userId = req.user._id;
    const player = await Player.findOne({ userID: userId });

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Fetch the player's most recent ACL assessment
    const assessment = await aclRehabExercise
      .find({ playerId: player._id })
      .sort({ createdAt: -1 })
      .exec();

    if (!assessment) {
      return res
        .status(404)
        .json({ message: "No assessment found for this player." });
    }

    // Fetch exercises based on the assessment result
    const exercises = await RehabPlanExercise.find({
      injuryType: assessment.assessmentResult,
    });
    res.json({ exercises, assessment });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching recommended exercises", error });
  }
};

// upload the exercises by admin
