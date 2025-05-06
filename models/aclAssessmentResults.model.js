import mongoose from "mongoose";

const { Schema } = mongoose;

const aclAssessmentResultSchema = new Schema(
  {
    playerId: { 
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    mriFileId: {
      type: Schema.Types.ObjectId,
      ref: "MRIFile",
      required: true,
    },
    assessmentResult: {
      type: String,
      enum: [
        "Healthy",
        "ACL Tear",
        "Partial ACL Tear OR Partially Injured",
        "Complete ACL Tear OR Completely Ruptured",
      ],
      required: true,
    },
    reportPath: {
      type: String,
    },
    assessmentDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("AclAssessmentResult", aclAssessmentResultSchema);
