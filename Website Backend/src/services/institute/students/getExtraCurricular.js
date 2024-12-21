import ExtraCurricular from "../../../models/extraCurrricular.model.js";

export default async function getExtraCurricular(institute_id, course_id) {
  try {
    if (!institute_id || !course_id) {
      throw new ApiError(400, "Institute ID and Course ID is required");
    }
    const extraCurriculars = await ExtraCurricular.find({
      institute_id,
      course_id,
    });
    return extraCurriculars;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}
