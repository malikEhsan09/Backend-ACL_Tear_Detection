import mongoose from "mongoose";
const { Schema } = mongoose;

const timingSchema = new Schema(
  {
    startTime: { type: Date,  }, // Full start date and time
    endTime: { type: Date, }, // Full end date and time
    status: { type: String, enum: ["available", "booked"], default: "available" },
  },
  { _id: false } // Prevent separate IDs for timings
);

const slotSchema = new Schema(
  {
    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      required: true,
    },
    timings: [timingSchema],
  },
  { _id: false } // Prevent separate IDs for slots
);

const doctorScheduleSchema = new Schema(
  {
    doctorID: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor"},
    // doctorID : {type : String},
    userName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    specialization: { type: String, required: true },
    image: { type: String },
    slots: [slotSchema],
  },
  { timestamps: true }
);

export default mongoose.model("DoctorSchedule", doctorScheduleSchema);
