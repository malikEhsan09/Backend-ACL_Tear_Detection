import mongoose from "mongoose";

const aclRehabExerciseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  imageSrc: String,
  steps: [String],
  injuryType: {
    type: String,
    enum: [
      "Healthy",
      "ACL Tear",
      "Partial ACL Tear OR Partially Injured",
      "Complete ACL Tear OR Completely Ruptured",
    ],
    required: true,
  },
  isCompleted: { type: Boolean, default: false },
  isScheduled: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const aclRehabExercise = mongoose.model("aclRehab", aclRehabExerciseSchema);
export default aclRehabExercise;
