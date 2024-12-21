import StudentsPerformance from "../../models/studentsPerformance.model.js";
import ApiError from "../../utils/ApiError.js";

export default async function getPerformance(institute_id) {
  try {
    if (!institute_id) {
      throw new ApiError(400, "Institute ID is required");
    }
    const performance = await StudentsPerformance.find({
      institute_id: institute_id,
    });
    if (!performance) {
      throw new ApiError(400, "Performance not found");
    }
    return performance;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}
