import mongoose from "mongoose";
import { ACTIVITIES, EXTRA_CURRICULAR_ACTIVITIES } from "../constants.js";

// Define the schema first
const extraCurricularCountSchema = new mongoose.Schema({
  activity: {
    type: String,
    enum: {
      values: EXTRA_CURRICULAR_ACTIVITIES,
      message: "{VALUE} is not a valid activity",
    },
  },
  count: {
    type: Number,
    required: [true, "Count is required"],
    default: 0, // Default   to 0 if not specified
  },
});
// Define the schema first
const activityAnalysisSchema = new mongoose.Schema({
  activity: {
    type: String,
    enum: {
      values: ACTIVITIES,
      message: "{VALUE} is not a valid activity",
    },
  },
  count: {
    type: Number,
    required: [true, "Count is required"],

    default: 0, // Default   to 0 if not specified
  },
});

extraCurricularCountSchema.methods.incrementCount = function (activity) {
  return this.model("ExtraCurricularCount").findOneAndUpdate(
    { activity: activity },
    { $inc: { count: 1 } },
    { new: true, upsert: true }, // Ensures the document is created if it doesn't exist
  );
};

export const ExtraCurricularCount = mongoose.model(
  "ExtraCurricularCount",
  extraCurricularCountSchema,
);

const instituteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      validate: {
        validator: (name) => /^[a-zA-Z\s]+$/.test(name),
        message: "Name must be a valid name",
      },
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      minlength: [10, "Address must be at least 10 characters"],
    },
    contact: {
      type: String,
      required: [true, "Contact is required"],
      trim: true,
      match: [/^\d{10}$/, "Contact is not a valid Indian mobile number"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Email is not a valid email address",
      ],
    },
    institute_head_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    region_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Region",
      required: [true, "Region ID is required"],
      alias: "region",
    },
    unit_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: [true, "Unit ID is required"],
      alias: "unit",
    },
    extra_curriculars: {
      type: [extraCurricularCountSchema],
      default: [],
    },
    activityAnalysis: {
      type: [activityAnalysisSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save hook to check for duplicate activities
instituteSchema.pre("save", function (next) {
  const activities = this.extra_curriculars.map((item) => item.activity);
  if (new Set(activities).size !== activities.length) {
    return next(new Error("Duplicate activities are not allowed."));
  }
  next();
});

// Increment activity count
instituteSchema.methods.incrementActivityCount = async function (activity) {
  const extraCurricular = this.extra_curriculars.find(
    (item) => item.activity === activity,
  );
  if (extraCurricular) {
    extraCurricular.count += 1;
  } else {
    this.extra_curriculars.push({ activity, count: 1 });
  }
  return this.save();
};

const Institute = mongoose.model("Institute", instituteSchema);

export default Institute;
