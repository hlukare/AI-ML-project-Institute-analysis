import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import {
  addExtraCurricularService,
  getExtraCurricularService,
} from "../../../services/institute/students/index.js";
export async function addExtraCurricular(req, res, next) {
  try {
    const { institute_id, course_id, activities } = req.body;
    if (!institute_id || !course_id || !activities) {
      return next(
        new ApiError(
          400,
          "Institute ID, Course ID and Activities are required",
        ),
      );
    }

    const extraCurricular = await addExtraCurricularService(
      institute_id,
      course_id,
      activities,
    );
    return res.json(new ApiResponse(200, extraCurricular));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}

export async function getExtraCurriculars(req, res, next) {
  try {
    const { institute_id, course_id } = req.params;
    if (!institute_id || !course_id) {
      return next(new ApiError(400, "Institute ID and Course ID is required"));
    }
    const extraCurriculars = await getExtraCurricularService(
      institute_id,
      course_id,
    );
    return res.json(new ApiResponse(200, extraCurriculars));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}
