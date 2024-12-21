import Course from "../../models/course.model.js";
import ApiError from "../../utils/ApiError.js";
export default async function getCourseAnalysis(institute_id) {
  try {
    if (!institute_id) {
      throw new ApiError(400, "Institute ID and Course ID are required");
    }
    const course = await Course.findOne({
      institute_id: institute_id,
    });
    if (!course) {
      throw new ApiError(400, "Course not found");
    }
    return course.analysis;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}
