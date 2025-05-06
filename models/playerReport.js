import mongoose from "mongoose";

const { Schema } = mongoose;

const playerReportSchema = new Schema(
  {
    playerId: {
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    pdfReport: {
      type: Buffer,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PlayerReport", playerReportSchema);
