import express from "express";
import {
  addCourse,
  deleteCourse,
  getCourseById,
  getCourses,
  updateCourse,
  addStudentsPerformance,
  getPerformances,
  addExtraCurricular,
  getExtraCurriculars,
  getTimetable,
  updateTimetable,
  assignTeacherToCourse,
  teacherCourseAnalysis,
} from "../../../controllers/location/institute/index.js";
import pdfUpload from "../../../middlewares/multer/pdfUpload.js";
import { authRoleMiddleware } from "../../../middlewares/auth.middleware.js";
import { USER_ROLE } from "../../../constants.js";
const router = express.Router();
// COURSE ROUTES

// PERFORM TEACHER COURSE ANALYSIS
router.get(
  "/:institute_id/:course_id/:teacher_id/analysis",
  teacherCourseAnalysis,
);

router.use(
  "/",
  authRoleMiddleware([
    USER_ROLE.superAdmin,
    USER_ROLE.regionLead,
    USER_ROLE.unitLead,
    USER_ROLE.instituteHead,
  ]),
);
router.get("/:institute_id", getCourses);
router.get("/:institute_id/:course_id", getCourseById);
router.post("/", pdfUpload.single("syllabus"), addCourse);
router.put(
  "/:institute_id/:course_id",
  pdfUpload.single("syllabus"),
  updateCourse,
);
router.delete("/:institute_id/:course_id", deleteCourse);

router.post("/:institute_id/:course_id/timetable", updateTimetable);
router.get("/:institute_id/:course_id/timetable", getTimetable);

// STUDENT ROUTES
router.get("/studentsPerformance/:institute_id/:course_id", getPerformances);
router.post("/studentsPerformance", addStudentsPerformance);

// EXTRA CURRICULAR ROUTES
router.get("/extracurricular/:institute_id/:course_id", getExtraCurriculars);
router.post("/extracurricular", addExtraCurricular);

// ASSIGN TEACHER TO COURSE
router.post("/:institute_id/:course_id/assignTeacher", assignTeacherToCourse);

export default router;
