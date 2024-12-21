import mongoose from "mongoose";

const unitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      validate: {
        validator: (value) => /^[a-zA-Z\s]*$/.test(value),
        message: "Name must contain only alphabetic characters and spaces",
      },
    },
    region_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Region",
      required: [true, "Region ID is required"],
      validate: {
        validator: (value) => mongoose.Types.ObjectId.isValid(value),
        message: "Invalid Region ID",
      },
    },
    unit_lead_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: (value) => mongoose.Types.ObjectId.isValid(value),
        message: "Invalid Lead ID",
      },
    },
  },
  {
    timestamps: true,
  },
);

const Unit = mongoose.model("Unit", unitSchema);

export default Unit;
