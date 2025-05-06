import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    feedbackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feedback", // Reference to the feedback document
    },
    type: {
      type: String,
      enum: ["feedback", "system", "query"],
      default: "feedback",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
