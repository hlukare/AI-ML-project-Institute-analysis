import assignInstituteHeadService from "./assignInstituteHead.js";
import registerInstituteService from "./registerInstitute.js";
import {
  getInstitutes as getInstitutesService,
  getInstituteById as getInstituteByIdService,
} from "./getInstitute.js";
import updateInstituteService from "./updateInstitute.js";
import deleteInstituteService from "./deleteInstitute.js";

export {
  assignInstituteHeadService,
  registerInstituteService,
  getInstitutesService,
  getInstituteByIdService,
  updateInstituteService,
  deleteInstituteService,
};
