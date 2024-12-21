import StudentsPerformance from "../../../models/studentsPerformance.model.js";
import Institute from "../../../models/institute.model.js";
import Course from "../../../models/course.model.js";
import ApiError from "../../../utils/ApiError.js";
import config from "../../../config/config.js";
import axios from "axios";
export async function addPerformance(performance) {
  try {
    if (!performance) {
      throw new ApiError(400, "Performance is required");
    }
    const instituteExits = await Institute.findById(performance.institute_id);
    if (!instituteExits) {
      throw new ApiError(400, "Institute not found");
    }
    const courseExits = await Course.findById(performance.course_id);
    if (!courseExits) {
      throw new ApiError(400, "Course not found");
    }
    const { institute_id, course_id, ...performanceObj } = performance;

    //TODO: CALL AI API ENPOINT TO PERFORM ANALYSIS -> STORE THE RESULT IN DB
    console.log(performanceObj);
    const analysis = await axios.post(
      `${config.AI_URL}/process_scores`,
      performanceObj,
    );

    performance.analysis = analysis.dataw;
    const newPerformance = await StudentsPerformance.create(performance);
    if (newPerformance) {
      return newPerformance;
    }
    if (!newPerformance) {
      throw new ApiError(400, "Performance not created");
    }
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}

export default addPerformance;
