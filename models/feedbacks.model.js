import mongoose from "mongoose";
const { Schema } = mongoose;

const feedbackSchema = new Schema({
  player: {
    type: Schema.Types.ObjectId,
    ref: "Player",
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  sentiment: {
    type: String,
    enum: ["positive", "negative", "neutral"],
    required: true,
  },
  comments: {
    type: String,
  },
  survey: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Feedback", feedbackSchema);
