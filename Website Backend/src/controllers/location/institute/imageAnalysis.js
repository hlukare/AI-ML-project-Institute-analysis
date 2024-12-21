import mongoose from "mongoose";
import { ACTIVITIES } from "../../../constants";

const suitabilitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, "Type is required"],
    enum: {
      values: [String],
      message: "{VALUE} is not a valid activity",
    },
  },
  score: {
    type: Number,
    required: [true, "Score is required"],
    min: [0, "Score must be a positive number"],
    max: [100, "Score must be between 0 and 100"],
  },
});

const imageSchema = new mongoose.Schema(
  {
    institute_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: [true, "Institute ID is required"],
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
    },
    analysis: {
      activity: {
        type: [String],
        enum: {
          values: [ACTIVITIES],
          message: "{VALUE} is not a valid activity",
        },
      },
      infrastructure: {
        type: [String],
      },
      suitability: {
        type: [suitabilitySchema],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  },
);

const ImageAnalysis = mongoose.model("ImageAnalysis", imageSchema);
export default ImageAnalysis;
