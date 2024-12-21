import Course from "../../../models/course.model.js";
import ApiError from "../../../utils/ApiError.js";
import User from "../../../models/user.model.js";

export default async function assignTeacherToCourse(
  institute_id,
  course_id,
  teacher_id,
) {
  try {
    if (!institute_id || !course_id || !teacher_id) {
      throw new ApiError(
        400,
        "Institute ID, Course ID and Teacher ID are required",
      );
    }
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
    course.teacher = teacher._id;
    await course.save();
    return course;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}
