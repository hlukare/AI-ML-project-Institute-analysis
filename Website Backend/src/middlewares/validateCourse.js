import Institute from "../models/institute.model.js";
import Course from "../models/course.model.js";
import ApiError from "../utils/ApiError.js";

export default async function validateCourse(req, res, next) {
  try {
    const { institute_id, course_id } = req.params;
    if (!institute_id || !course_id) {
      return next(new ApiError(400, "Institute ID and Course ID are required"));
    }

    const course = await Course.findOne({
      institute_id: institute_id,
      _id: course_id,
    });
    if (!course) {
      return next(new ApiError(400, "Course not found"));
    }
    next();
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}
