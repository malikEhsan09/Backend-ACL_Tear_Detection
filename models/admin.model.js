import mongoose from "mongoose";
const { Schema } = mongoose; // Import Schema from mongoose

const adminSchema = new Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // unique: true,
    },
    email: {
      type: String,
    },
    name: {
      type: String,
      // required: true,
    },
    phoneNumber: {
      type: String,
      // required: true,
    },
    CNIC: {
      type: String,
      // required: true,
      // unique: true,
      // length: 13,
    },
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// adminSchema.pre("findOneAndUpdate", function (next) {
//   this.update({}, { $set: { updatedAt: Date.now() } });
//   next();
// });

export default mongoose.model("Admin", adminSchema);
