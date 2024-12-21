import Course from "../../../models/course.model.js";
import ApiError from "../../../utils/ApiError.js";
export default async function deleteCourseService(institute_id, course_id) {
  try {
    if (!institute_id || !course_id) {
      throw new ApiError(400, "Institute ID and Course ID is required");
    }
    const course = await Course.findOneAndDelete({
      institute_id: institute_id,
      _id: course_id,
    });
    if (!course) {
      throw new ApiError(400, "Course not found");
    }
    return course;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}
