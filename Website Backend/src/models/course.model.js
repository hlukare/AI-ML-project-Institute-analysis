import mongoose from "mongoose";

// Define the Timetable Schema
const timetableSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: [true, "Day is required"],
      enum: {
        values: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        message: "{VALUE} is not a valid day",
        unique: true,
      },
    },
    sessions: [
      {
        start_time: {
          type: String,
          required: [true, "Start time is required"],
          validate: {
            validator: (value) =>
              /\b([01]\d|2[0-3]):([0-5]\d):([0-5]\d)\b/.test(value),
            message: "Start time must be in HH:mm:ss format",
          },
        },
        end_time: {
          type: String,
          required: [true, "End time is required"],
          validate: {
            validator: (value) =>
              /\b([01]\d|2[0-3]):([0-5]\d):([0-5]\d)\b/.test(value),
            message: "End time must be in HH:mm:ss format",
          },
        },
        topic: {
          type: String,
          required: [true, "Topic is required"],
          trim: true,
          minlength: [3, "Topic must be at least 3 characters long"],
        },
      },
    ],
  },
  { _id: false }, // Disable _id for subdocuments if not needed
);

// Course Schema
const courseSchema = new mongoose.Schema(
  {
    institute_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: [true, "Institute ID is required"],
      validate: {
        validator: (value) => mongoose.Types.ObjectId.isValid(value),
        message: "Invalid Institute ID",
      },
    },
    course_name: {
      type: String,
      required: [true, "Course name is required"],
      trim: true,
      minlength: [3, "Course name must be at least 3 characters long"],
      validate: {
        validator: (value) => /^[a-zA-Z\s]+$/.test(value),
        message:
          "Course name must contain only alphabetic characters and spaces",
      },
    },
    course_code: {
      type: String,
      required: [true, "Course code is required"],
      trim: true,
      uppercase: true,
      minlength: [3, "Course code must be at least 3 characters long"],
    },
    course_duration: {
      type: Number,
      required: [true, "Course duration is required"],
      min: [1, "Course duration must be at least 1 year"],
    },
    course_fee: {
      type: Number,
      required: [true, "Course fee is required"],
      min: [0, "Course fee must be a non-negative number"],
    },
    is_Completed: {
      type: Boolean,
      default: false,
    },
    course_description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
      minlength: [10, "Course description must be at least 10 characters long"],
    },
    infrastructure_requirements: {
      type: [String],
      required: [true, "Infrastructure requirements are required"],
      validate: {
        validator: (value) =>
          value.length > 0 && value.every((item) => item.trim() !== ""),
        message: "Each infrastructure requirement must be a non-empty string",
      },
    },
    course_objectives: {
      type: [String],
      required: [true, "Course objectives are required"],
      validate: {
        validator: (value) =>
          value.length > 0 && value.every((item) => item.trim() !== ""),
        message: "Each course objective must be a non-empty string",
      },
    },
    upload_date: {
      type: Date,
      default: Date.now,
    },
    syllabus: {
      type: String,
      required: [true, "Syllabus is required"],
    },
    score: {
      type: Number,
      default: 0,
      min: [0, "Score must be a positive number"],
    },
    analysis: {
      type: Object,
      default: {},
    },
    timetable: {
      type: [timetableSchema], // Embedding the timetable schema
      default: [],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

const Course = mongoose.model("Course", courseSchema);

export default Course;
