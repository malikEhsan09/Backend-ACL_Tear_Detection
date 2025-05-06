import mongoose from "mongoose";

const { Schema } = mongoose;

const promoSchema = new Schema(
  {
    promoId: {
      type: String,
      required: true,
      unique: true,
    },
    clubId: {
      type: mongoose.Schema.Types.ObjectId, // Ensure this is set correctly
      ref: "Club",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    startDate: {
      type: Date,
      // required: true,
    },
    endDate: {
      type: Date,
      // required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxUses: {
      type: Number,
      default: 1,
    },
    currentUses: {
      type: Number,
      default: 0,
    },

  },
  { timestamps: true }
);

export default mongoose.model("Promo", promoSchema);
