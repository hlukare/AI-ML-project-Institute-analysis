import Course from "../../../models/course.model.js";

export default async function getTimetable(institute_id, course_id) {
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
    return course.timetable;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}
