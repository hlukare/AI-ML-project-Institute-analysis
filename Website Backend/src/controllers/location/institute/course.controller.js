import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import createNotNullObject from "../../../utils/createNotNullObject.js";
import {
  addCourseService,
  deleteCourseService,
  getCourseByIdService,
  getCoursesService,
  updateCourseService,
  updateTimetableService,
  getTimetableService,
  assignTeacherToCourseService,
  teacherCourseAnalysisService,
} from "../../../services/institute/course/index.js";
export async function addCourse(req, res, next) {
  try {
    const {
      institute_id,
      course_name,
      course_code,
      course_duration,
      course_fee,
      course_description,
      infrastructure_requirements,
      course_objectives,
      teacher,
      // analysisParams,
    } = req.body;
    const requiredFields = {
      institute_id,
      course_name,
      course_code,
      course_duration,
      course_fee,
      course_description,
      infrastructure_requirements,
      course_objectives,
      teacher,
      // analysisParams,
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        console.log(`${key} is null or undefined`);
        return next(new ApiError(400, "All fields are required"));
      }
    }

    const file = req.file;
    const course = {
      institute_id,
      course_name,
      course_code,
      course_duration: Number(course_duration),
      course_fee,
      course_description,
      infrastructure_requirements,
      course_objectives,
      teacher,
      // analysisParams,
    };

    const institute = await addCourseService(
      course,
      file ? file.path : null,
      // analysisParams,
    );
    res.json(new ApiResponse(200, institute));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}

export async function getCourses(req, res, next) {
  try {
    const { institute_id } = req.params;
    if (!institute_id) {
      return next(new ApiError(400, "Institute ID is required"));
    }
    const courses = await getCoursesService(institute_id);
    res.json(new ApiResponse(200, courses));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}

export async function getCourseById(req, res, next) {
  try {
    const { institute_id, course_id } = req.params;
    if (!institute_id || !course_id) {
      return next(new ApiError(400, "Course ID is required"));
    }
    const course = await getCourseByIdService(institute_id, course_id);
    res.json(new ApiResponse(200, course));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}

export async function deleteCourse(req, res, next) {
  try {
    const { institute_id, course_id } = req.params;
    if (!institute_id || !course_id) {
      return next(new ApiError(400, "Institute ID and Course ID is required"));
    }
    const course = await deleteCourseService(institute_id, course_id);
    res.json(new ApiResponse(200, course));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}

export async function updateCourse(req, res, next) {
  try {
    const { course_id } = req.params;
    if (!course_id) {
      return next(new ApiError(400, "Course ID is required"));
    }
    const {
      course_name,
      course_code,
      course_duration,
      course_fee,
      course_description,
      infrastructure_requirements,
      course_objectives,
    } = req.body;
    const file = req.file;
    let updateCourseObject = {
      course_name,
      course_code,
      course_duration,
      course_fee,
      course_description,
      infrastructure_requirements,
      course_objectives,
    };
    if (file) {
      updateCourseObject.syllabus = file.path;
    }
    updateCourseObject = createNotNullObject(updateCourseObject);
    if (Object.keys(updateCourseObject).length === 0) {
      return next(
        new ApiError(400, "At least one field is required to update"),
      );
    }
    const course = await updateCourseService(course_id, updateCourseObject);
    res.json(new ApiResponse(200, course));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}

export async function assignTeacherToCourse(req, res, next) {
  try {
    const { institute_id, course_id } = req.params;
    const { teacher_id } = req.body;
    if (!institute_id || !course_id || !teacher_id) {
      return next(new ApiError(400, "Course ID and Teacher ID are required"));
    }
    const course = await assignTeacherToCourseService(
      institute_id,
      course_id,
      teacher_id,
    );
    res.json(new ApiResponse(200, course));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}

export async function updateTimetable(req, res, next) {
  try {
    const { institute_id, course_id } = req.params;
    if (!institute_id || !course_id) {
      return next(new ApiError(400, "Institute ID and Course ID is required"));
    }

    const { timetable } = req.body;
    if (!timetable) {
      return next(new ApiError(400, "Timetable is required"));
    }

    const course = await updateTimetableService(
      institute_id,
      course_id,
      timetable,
    );
    return res.json(new ApiResponse(200, course));
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}

export async function getTimetable(req, res, next) {
  try {
    const { institute_id, course_id } = req.params;
    if (!institute_id || !course_id) {
      return next(new ApiError(400, "Institute ID and Course ID is required"));
    }
    const course = await getTimetableService(institute_id, course_id);
    return res.json(new ApiResponse(200, course));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}

export async function teacherCourseAnalysis(req, res, next) {
  try {
    const { institute_id, course_id, teacher_id } = req.params;
    if (!institute_id || !course_id || !teacher_id) {
      return next(
        new ApiError(400, "Institute ID, Course ID and Teacher ID is required"),
      );
    }
    const analysis = await teacherCourseAnalysisService(
      institute_id,
      course_id,
      teacher_id,
    );
    return res.json(new ApiResponse(200, analysis));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}
