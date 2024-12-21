import {
  addPerformanceService,
  getPerformanceService,
} from "../../../services/institute/students/index.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import createNotNullObject from "../../../utils/createNotNullObject.js";

export async function addStudentsPerformance(req, res, next) {
  try {
    const {
      institute_id,
      course_id,
      avg_marks,
      total_marks = 100,
      avg_attendance,
      total_lectures_taken,
      total_lectures_assigned,
    } = req.body;
    if (
      !institute_id ||
      !course_id ||
      !avg_marks ||
      !total_marks ||
      !total_lectures_taken ||
      !total_lectures_assigned ||
      !avg_attendance
    ) {
      return next(new ApiError(400, "All fields are required"));
    }
    let performanceObject = {
      institute_id,
      course_id,
      avg_marks,
      total_marks,
      total_lectures_taken,
      total_lectures_assigned,
      avg_attendance,
    };
    // performanceObject = createNotNullObject(performanceObject);
    if (Object.keys(performanceObject).length === 0) {
      return next(
        new ApiError(400, "At least one field is required to create"),
      );
    }

    const performance = await addPerformanceService(performanceObject);

    //TODO: CALL AI API ENPOINT TO PERFORM ANALYSIS -> STORE THE RESULT IN DB

    return res.json(new ApiResponse(200, performance));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}

export async function getPerformances(req, res, next) {
  try {
    const { institute_id, course_id } = req.params;
    if (!institute_id || !course_id) {
      return next(new ApiError(400, "Institute ID and Course ID are required"));
    }
    const performance = await getPerformanceService(institute_id, course_id);
    return res.json(new ApiResponse(200, performance));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}
