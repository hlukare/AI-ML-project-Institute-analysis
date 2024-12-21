import mongoose from "mongoose";

const teacherCourseAnalysisSchema = new mongoose.Schema(
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
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Teacher ID is required"],
    },
    analysis: {
      type: Object,
      required: [true, "Analysis is required"],
    },
  },
  {
    timestamps: true,
  },
);

const TeacherCourseAnalysis = mongoose.model(
  "TeacherCourseAnalysis",
  teacherCourseAnalysisSchema,
);
export default TeacherCourseAnalysis;
