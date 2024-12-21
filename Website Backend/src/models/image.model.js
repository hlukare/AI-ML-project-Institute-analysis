import mongoose from "mongoose";
import { IMAGE_STATUS, MAX_IMAGES_UPLOAD, ACTIVITIES } from "../constants.js";

// Define suitability schema for activities analysis
const suitabilitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, "Type is required"],
    enum: {
      values: ACTIVITIES,
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

// Define image schema
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
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (value) {
          return value.length <= MAX_IMAGES_UPLOAD;
        },
        message: `You can upload a maximum of ${MAX_IMAGES_UPLOAD} images at a time`,
      },
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: Object.values(IMAGE_STATUS),
        message: "{VALUE} is not a valid status",
      },
      default: IMAGE_STATUS.uploaded,
    },
    analysis: {
      activity: {
        type: [String],
        enum: {
          values: ACTIVITIES,
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
    analysis: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

// Create the Image model
const Image = mongoose.model("Image", imageSchema);
export default Image;
