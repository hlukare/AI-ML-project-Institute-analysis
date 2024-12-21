import StudentsPerformance from "../../../models/studentsPerformance.model.js";
import ApiError from "../../../utils/ApiError.js";

export default async function getPerformance(institute_id, course_id) {
  try {
    if (!institute_id || !course_id) {
      throw new ApiError(400, "Institute ID and Course ID are required");
    }
    const performance = await StudentsPerformance.find({
      institute_id: institute_id,
      course_id: course_id,
    });
    if (!performance) {
      throw new ApiError(400, "Performance not found");
    }
    return performance;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}
