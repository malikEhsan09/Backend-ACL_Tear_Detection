import mongoose from "mongoose";

const { Schema } = mongoose;

const playerSchema = new Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      // required: true,
    },
    lastName: {
      type: String,
      // required : true
    },
    age: {
      type: Number,
      min: 0,
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "Male", "Female", "Other"],
    },
    nationality: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/dr5p2iear/image/upload/v1715453813/l4g96k4e7gpytkqair2q.jpg",
    },
    // these are all for the admin side
    club: {
      type: Schema.Types.ObjectId,
      ref: "Club",
    },
    isMember: {
      type: String,
      default: "Enrolled",
      enum: ["Enrolled", "Retired hurt", "Short leave"],
    },
    googleId: {
      type: String,
    },
    doctorID: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
    },
    adminID: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    promoCode: {
      type: Schema.Types.String,
      ref: "Promo",
    },
    promoCode: {
      type: String, 
    },

    // ! later on assign the sevrity of exercises to the player
    // assignedExercises: [
    //   {
    //     exerciseId: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: "Exercise",
    //     },
    //     severity: {
    //       type: String,
    //       enum: ["partiallyDamaged", "completelyRuptured"],
    //       required: true,
    //     },
    //   },
    // ],
  },
  { timestamps: true }
);

export default mongoose.model("Player", playerSchema);
