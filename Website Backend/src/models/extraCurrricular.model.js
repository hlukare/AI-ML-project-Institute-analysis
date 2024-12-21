import mongoose from "mongoose";
import { EXTRA_CURRICULAR_ACTIVITIES } from "../constants.js";
const activitiesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    enum: EXTRA_CURRICULAR_ACTIVITIES,
  },
  is_conducted: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    trim: true,
    validate: {
      validator: function (value) {
        return value.split(" ").length <= 500;
      },
      message: "Description must be less than 500 words",
    },
  },
});

const extraCurricularSchema = new mongoose.Schema(
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
    activities: {
      type: [activitiesSchema],
      default: [],
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

const ExtraCurricular = mongoose.model(
  "ExtraCurricular",
  extraCurricularSchema,
);

export default ExtraCurricular;
