// models/user.model.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    userName: {
      type: String,
    },
    googleID: {
      type: String,
      unique: true,
    },
    facebookID: {
      type: String,
    },
    name: {
      type: String,
    },
    profilePicture: {
      type: String, // URL to the profile picture for the googlee
    },
    userType: {
      type: String,
      enum: ["Player", "Admin", "Doctor"],
      default: "Player",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
