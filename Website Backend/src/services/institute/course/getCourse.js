import Course from "../../../models/course.model.js";
import Institute from "../../../models/institute.model.js";
import ApiError from "../../../utils/ApiError.js";
export async function getCourses(institute_id) {
  try {
    if (!institute_id) {
      throw new ApiError(400, "Institute ID is required");
    }
    const courses = await Course.find({ institute_id: institute_id }).populate(
      "teacher",
    );
    return courses;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}

export async function getCourseById(institute_id, course_id) {
  try {
    if (!institute_id || !course_id) {
      throw new ApiError(400, "Institute ID and Course ID are required");
    }
    const course = await Course.findOne({
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
