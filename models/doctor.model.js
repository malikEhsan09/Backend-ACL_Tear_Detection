import mongoose from "mongoose";
const { Schema } = mongoose;

const doctorSchema = new Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
    },
    firstName: {
      type: String,
      // required: true,
    },
    lastName: {
      type: String,
      // required : true
    },
    medicalLicenseNo: {
      type: String,
      unique: true,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "Male", "Female", "Other"],
    },
    specialization: {
      type: String,
      required: true,
    },
    nationality: {
      type: String,
    },
    address: {
      type: String,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numberOfRatings: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
