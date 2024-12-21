import getInstituteAnalysis from "../services/analysis/instituteAnalysis.js";
import getImagesAnalysis from "../services/analysis/imageAnalysis.js";
import getCourseAnalysis from "../services/analysis/courseAnalysis.js";
import getPerformance from "../services/analysis/studentPerformanceAnalysis.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import Institute from "../models/institute.model.js";
export default async function analysis(req, res, next) {
  try {
    const { institute_id } = req.query;
    const institute = await Institute.findById(institute_id);
    if (!institute) {
      throw new ApiError(400, "Institute not found");
    }

    console.log("Best Institute Activity: ", bestInstituteActivity);
    //Institute: average_points, best_classroom_activity, extracurriular
    const instituteAnalysis = await getInstituteAnalysis(institute_id);

    //Images: impairment_analysis, infrastructure_suggestions
    const impairment_analysis = await getImagesAnalysis(institute_id);

    //Course: analysis result: Difficulty Level, Key topcis, recommednded prequesites
    const courseAnalysis = await getCourseAnalysis(institute_id);

    //Student Performance
    const studentsPerformance = await getPerformance(institute_id);

    // console.log("Classroom Analysis: ", instituteAnalysis);
    // console.log("Image Analysis: ", imageAnalysis);
    // console.log("Course Analysis: ", courseAnalysis);
    // console.log("Student Performance: ", studentsPerformance);
    const finalObject = {
      instituteAnalysis,
    };
    return res.json(new ApiResponse(200, "Analysis"));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}
