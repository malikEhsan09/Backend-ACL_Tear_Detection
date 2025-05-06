import mongoose from "mongoose";

const admissionSchema = new mongoose.Schema(
  {
    feeID: {
      type: String,
    },
    name: {
      type: String,
    },
    cnic: {
      type: String,
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"], // this change i make
    },
    selectedSports: {
      type: [String],
    },
    selectedClubs: {
      type: [String],
    },
    pNationality: {
      //playerNationality
      type: String,
    },
    fname: {
      //fatherName
      type: String,
    },
    fcnic: {
      type: String,
    },
    fcell: {
      type: String,
    },
    femail: {
      type: String,
    },
    fnationality: {
      type: String,
    },
    fcompany: {
      type: String,
    },
    foccupation: {
      type: String,
    },
    feducation: {
      type: String,
    },
    mname: {
      type: String,
    },
    moccupation: {
      type: String,
    },
    meducation: {
      type: String,
    },

    mcompany: {
      type: String,
    },
    mcell: {
      type: String,
    },
    mIsWorking: {
      type: String,
    },
    mjob: {
      type: String,
    },
    address: {
      type: String,
    },
    others: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "Waiting",
    },
  },
  { timestamps: true }
);
export default mongoose.model("Admission", admissionSchema);
