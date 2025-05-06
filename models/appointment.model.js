import mongoose from "mongoose";
const { Schema } = mongoose;

const appointmentSchema = new Schema(
  {
    playerID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorID: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    scheduleID: {
      type: Schema.Types.ObjectId,
      ref: "DoctorSchedule",
      required: true,
    },
    slot: {
      day: { type: String, required: true },
      time: { type: String, required: true },
    },
    appointmentType: {
      type: String,
      enum: ["physical", "online"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);
