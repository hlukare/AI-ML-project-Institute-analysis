import User from "../../../models/user.model.js";
import Course from "../../../models/course.model.js";
import TeacherCourseAnalysis from "../../../models/teacherCourseAnalysis.model.js";
export default async function teacherCourseAnalysisService(
  institute_id,
  course_id,
  teacher_id,
) {
  try {
    const course = await Course.findOne({
      institute_id: institute_id,
      _id: course_id,
    });
    if (!course) {
      throw new ApiError(400, "Course not found");
    }
    const teacher = await User.findOne({
      _id: teacher_id,
    });
    if (!teacher) {
      throw new ApiError(400, "Teacher not found");
    }
    if (teacher.role !== "Teacher") {
      throw new ApiError(400, "User is not a teacher");
    }

    //TODO: CALL AI API ENPOINT TO PERFORM ANALYSIS -> STORE THE RESULT IN DB

    const analysis = {
      alignment_score: 5,
      average_points: 9,
    }; //!DEMONSTRATION ONLY

    const teacherCourseAnalysis = await TeacherCourseAnalysis.create({
      institute_id: institute_id,
      course_id: course_id,
      teacher_id: teacher_id,
      analysis: analysis,
    });

    return teacherCourseAnalysis;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}
