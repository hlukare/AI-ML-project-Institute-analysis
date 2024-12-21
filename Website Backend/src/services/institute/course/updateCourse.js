import Course from "../../../models/course.model.js";
import Institute from "../../../models/institute.model.js";
import ApiError from "../../../utils/ApiError.js";
export default async function updateCourseService(course_id, course) {
  try {
    if (!course_id) {
      throw new ApiError(400, "Course ID is required");
    }
    const existingCourse = await Course.findById(course_id);
    if (!existingCourse) {
      throw new ApiError(400, "Course not found");
    }
    const updatedCourse = await Course.findByIdAndUpdate(
      course_id,
      { $set: course },
      { new: true },
    );
    return updatedCourse;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}
