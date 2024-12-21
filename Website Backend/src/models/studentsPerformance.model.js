import mongoose from "mongoose";

const studentsPerformanceSchema = new mongoose.Schema({
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
  avg_marks: {
    type: Number,
    required: [true, "Average score is required"],
    min: [0, "Average score must be a positive number"],
  },
  total_score: {
    type: Number,
    required: [true, "Total score is required"],
    default: 100, //! REMOVE IT IN THE FUTURE
    min: [0, "Total score must be a positive number"],
  },
  performance_ratio: {
    type: Number,
    min: [0, "Performance ratio must be a positive number"],
  },
  avg_attendance: {
    type: Number,
    required: [true, "Average attendance is required"],
    min: [0, "Average attendance must be a positive number"],
  },
  total_lectures_assigned: {
    type: Number,
    required: [true, "Total lectures assigned is required"],
    min: [0, "Total lectures assigned must be a positive number"],
  },
  total_lectures_taken: {
    type: Number,
    required: [true, "Total lectures taken is required"],
    min: [0, "Total lectures taken must be a positive number"],
  },
  attendance_ratio: {
    type: Number,
    min: [0, "Attendance ratio must be a positive number"],
  },
  analysis: {
    type: Object,
    default: {},
  },
});

studentsPerformanceSchema.pre("save", async function (next) {
  if (this.isModified("avg_score") || this.isModified("total_score")) {
    this.performance_ratio = this.avg_score / this.total_score;
  }
  if (
    this.isModified("average_attendance") ||
    this.isModified("total_attendance")
  ) {
    this.attendance_ratio = this.average_attendance / this.total_attendance;
  }
  next();
});

const StudentsPerformance = mongoose.model(
  "StudentsPerformance",
  studentsPerformanceSchema,
);
export default StudentsPerformance;
