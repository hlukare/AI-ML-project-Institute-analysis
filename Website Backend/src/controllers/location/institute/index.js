import {
  assingInstituteHead,
  deleteInstitute,
  getInstituteById,
  getInstitutes,
  registerInstitute,
  updateInstitute,
} from "./institute.controller.js";
import {
  addCourse,
  deleteCourse,
  getCourseById,
  getCourses,
  updateCourse,
  assignTeacherToCourse,
  getTimetable,
  updateTimetable,
  teacherCourseAnalysis,
} from "./course.controller.js";

import {
  addStudentsPerformance,
  getPerformances,
} from "./students.controller.js";
import {
  addExtraCurricular,
  getExtraCurriculars,
} from "./extraCurricular.controller.js";

export {
  assingInstituteHead,
  deleteInstitute,
  getInstituteById,
  getInstitutes,
  registerInstitute,
  updateInstitute,
  addCourse,
  deleteCourse,
  getCourseById,
  getCourses,
  updateCourse,
  addStudentsPerformance,
  getPerformances,
  addExtraCurricular,
  getExtraCurriculars,
  updateTimetable,
  getTimetable,
  assignTeacherToCourse,
  teacherCourseAnalysis,
};
