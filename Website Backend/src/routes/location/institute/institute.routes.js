import express from "express";
import {
  getInstitutes,
  getInstituteById,
  registerInstitute,
  assingInstituteHead,
  updateInstitute,
  deleteInstitute,
} from "../../../controllers/location/institute/index.js";
import { authRoleMiddleware } from "../../../middlewares/auth.middleware.js";
import { USER_ROLE } from "../../../constants.js";
const router = express.Router();

// INSTITUTE ROUTES:
router.get("/", getInstitutes);
router.get("/:institute_id", getInstituteById);

router.use(
  "/",
  authRoleMiddleware([
    USER_ROLE.superAdmin,
    USER_ROLE.regionLead,
    USER_ROLE.unitLead,
  ]),
);
router.post("/", registerInstitute);
router.post("/assignInstituteHead", assingInstituteHead);
router.put("/:institute_id", updateInstitute);
router.delete("/:institute_id", deleteInstitute);

export default router;
