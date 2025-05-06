import Feedback from "../models/feedback.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import Notification from "../models/notification.model.js";
import Sentiment from "sentiment";

const { ObjectId } = mongoose.Types;

// initialize sentiment analyzer
const sentimentAnalyzer = new Sentiment();

//? Create feedback
export const submitFeedback = async (req, res) => {
  try {
    const { username, email, title, description, rating } = req.body;
    const userID = req.user._id;

    // Perform sentiment analysis on the description
    const sentimentResult = sentimentAnalyzer.analyze(description);
    let sentimentLabel = "Neutral";
    if (sentimentResult.score > 2) sentimentLabel = "Positive";
    else if (sentimentResult.score < 1) sentimentLabel = "Negative";

    // Create new feedback with the analyzed sentiment
    const newFeedback = new Feedback({
      userID,
      username,
      email,
      title,
      description,
      rating,
      sentiment: sentimentLabel,
    });

    // Save the feedback
    await newFeedback.save();

    // Create a notification for the admin with sentiment information
    const newNotification = new Notification({
      message: `New feedback from ${username} - Sentiment: ${sentimentLabel}`,
      feedbackId: newFeedback._id,
      type: "feedback",
    });

    // Save notification
    await newNotification.save();

    // Return response with the sentiment included
    return res.status(201).json({
      message: "Feedback submitted successfully",
      sentiment: sentimentLabel, // Include sentiment result in response
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

//? Get all feedbacks
export const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate(
      "userID",
      "email userType userName"
    );

    // check that feedback exist or not
    if (!feedbacks) {
      return res
        .status(404)
        .json({ message: "We can not found any feedback" });
    }

    // else if found then send this feedbacks
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//? Get feedbacks by sentiment
export const getFeedbacksBySentiment = async (req, res) => {
  try {
    const { sentiment } = req.params;

    const feedbacks = await Feedback.find({ sentiment }).populate(
      "userID",
      "email userType"
    );

    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedbacks by sentiment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//? Delete feedback by ID
export const deleteFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByIdAndDelete(id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
