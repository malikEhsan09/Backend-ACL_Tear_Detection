import mongoose from "mongoose";

const forgotPasswordSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    verificationCode: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("ForgotPassword", forgotPasswordSchema);
