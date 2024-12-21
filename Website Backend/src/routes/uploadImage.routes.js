import express from "express";
import uploadImage from "../middlewares/multer/imageUpload.js";
import { uploadImages } from "../controllers/location/institute/images.controller.js";
import { MAX_IMAGES_UPLOAD, USER_ROLE } from "../constants.js";
import validateCourse from "../middlewares/validateCourse.js";
import { authRoleMiddleware } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.use(
  authRoleMiddleware([
    USER_ROLE.superAdmin,
    USER_ROLE.regionLead,
    USER_ROLE.unitLead,
    USER_ROLE.instituteHead,
  ]),
);
router.post(
  "/upload/:institute_id/:course_id",
  uploadImage.array("images", MAX_IMAGES_UPLOAD),
  validateCourse,
  uploadImages,
);

export default router;
