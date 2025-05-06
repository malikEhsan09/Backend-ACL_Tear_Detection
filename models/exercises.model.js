import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    partiallyDamages: [
      {
        videoUrl: { type: String },
        thumbnailUrl: { type: String }, // Add thumbnail for partially injured videos
      },
    ],
    completelyRuptured: [
      {
        videoUrl: { type: String },
        thumbnailUrl: { type: String }, // Add thumbnail for ACL tear videos
      },
    ],
    tutorials: [
      {
        videoUrl: { type: String },
        thumbnailUrl: { type: String }, // Add thumbnail for tutorial videos
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Exercise", exerciseSchema);
