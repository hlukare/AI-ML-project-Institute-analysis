import axios from "axios";
import Course from "../../../models/course.model.js";
import Institute from "../../../models/institute.model.js";
import ApiError from "../../../utils/ApiError.js";
import config from "../../../config/config.js";
import { cloudinaryPDFUpload } from "../../cloudinary/cloudinaryPDFUpload.js";
import fs from "fs";
import FormData from "form-data";
import TeacherCourseAnalysis from "../../../models/teacherCourseAnalysis.model.js";
export default async function addCourseService(
  course,
  filePath,
  // analysisParams,
) {
  try {
    if (!course) {
      throw new ApiError(400, "Course is required");
    }
    if (!filePath) {
      throw new ApiError(400, "Syllabus is required");
    }
    const institute = await Institute.findById(course.institute_id);
    if (!institute) {
      throw new ApiError(400, "Institute not found");
    }
    const existingCourse = await Course.findOne({
      institute_id: course.institute_id,
      $or: [
        { course_name: course.course_name },
        { course_code: course.course_code },
      ],
    });
    if (existingCourse) {
      throw new ApiError(400, "Course already exists");
    }

    // Upload the Syllabus on cloudinary
    const uploadResponse = await cloudinaryPDFUpload(filePath);
    course.syllabus = uploadResponse;

    //! PERFORMING ANALYSIS
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));

    // Object.keys(analysisParams).forEach((key) => {
    //   formData.append(key, analysisParams[key]);
    // });
    const headers = Object.assign(
      { "Content-Type": "multipart/form-data" },
      formData.getHeaders(),
    );
    const analysis = await axios.post(`${config.AI_URL}/trends`, formData, {
      headers,
    });
    course.analysis = analysis.data;
    const newCourse = await Course.create(course);
    const { institute_id, teacher } = course;
    return { newCourse };
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}
