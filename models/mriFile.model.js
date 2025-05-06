import mongoose from "mongoose";

const { Schema } = mongoose;

const mriFileSchema = new Schema(
  {
    playerId: {
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    fileType: {
      type: String,
      enum: [".npy", ".pck", "application/octet-stream"],
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    assessmentResult: {
      type: Schema.Types.ObjectId,
      ref: "AclAssessmentResult",
    },
  },
  { timestamps: true }
);

export default mongoose.model("MRIFile", mriFileSchema);
