import Course from "../../../models/course.model.js";
import ApiError from "../../../utils/ApiError.js";
import validateTimetable from "./validateTimetable.js";
export default async function updateTimetable(
  institute_id,
  course_id,
  timetable,
) {
  try {
    if (!institute_id || !course_id || !timetable) {
      throw new ApiError(
        400,
        "Institute ID, Course ID and Timetable are required",
      );
    }
    const course = await Course.findOne({
      institute_id: institute_id,
      _id: course_id,
    });
    if (!course) {
      throw new ApiError(400, "Course not found");
    }
    validateTimetable(timetable);
    const days = course.timetable.map((t) => t.day);
    timetable.forEach((newTimetable) => {
      const index = days.indexOf(newTimetable.day);
      if (index === -1) {
        course.timetable.push(newTimetable);
      } else {
        course.timetable[index] = newTimetable;
      }
    });
    await course.save();
    return course;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}
