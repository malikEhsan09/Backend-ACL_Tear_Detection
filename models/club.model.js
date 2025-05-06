import mongoose from "mongoose";

const clubSchema = new mongoose.Schema(
  {
    clubName: {
      type: String,
      required: true,
      unique: true,
    },
    clubLogo: {
      type: String,
      default:
        "https://res.cloudinary.com/dr5p2iear/image/upload/v1715453815/hqdmcvhkkgocutpqdanx.jpg",
    },
    clubLocation: {
      type: String,
      required: true,
    },
    numOfMembers: {
      type: Number,
      default: 0, // Set a default value to avoid validation errors
    },
    maxCapacity: {
      type: Number,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
    },
    foundedYear: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Club", clubSchema);
