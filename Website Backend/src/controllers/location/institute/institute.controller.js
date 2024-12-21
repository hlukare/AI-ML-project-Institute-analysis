import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import createNotNullObject from "../../../utils/createNotNullObject.js";
import {
  assignInstituteHeadService,
  registerInstituteService,
  getInstituteByIdService,
  getInstitutesService,
  deleteInstituteService,
  updateInstituteService,
} from "../../../services/institute/institute/index.js";
import { USER_ROLE } from "../../../constants.js";

export async function registerInstitute(req, res, next) {
  try {
    const {
      name,
      address,
      contact,
      email,
      region_id,
      unit_id,
      institute_head_id,
    } = req.body;

    if (
      !name ||
      !address ||
      !contact ||
      !email ||
      !region_id ||
      !unit_id ||
      !institute_head_id
    ) {
      return next(new ApiError(400, "All fields are required"));
    }

    const institute = await registerInstituteService(
      name,
      address,
      contact,
      email,
      region_id,
      unit_id,
      institute_head_id,
    );

    res.json(new ApiResponse(200, institute));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}

export async function assingInstituteHead(req, res, next) {
  try {
    const { institute_id, institute_head_id } = req.body;

    if (!institute_id || !institute_head_id) {
      return next(new ApiError(400, "Institute ID and Head ID are required"));
    }

    const institute = await assignInstituteHeadService(
      institute_id,
      institute_head_id,
    );

    res.json(new ApiResponse(200, institute));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}

export async function getInstituteById(req, res, next) {
  try {
    const { institute_id } = req.params;
    if (!institute_id) {
      return next(new ApiError(400, "Institute ID is required"));
    }
    const institute = await getInstituteByIdService(institute_id);
    res.json(new ApiResponse(200, institute));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}

export async function getInstitutes(req, res, next) {
  try {
    const { unit_id, region_id, unit_name, region_name } = req.query;
    let filter = {};
    if (unit_id) {
      filter.unit_id = unit_id;
    }
    if (region_id) {
      filter.region_id = region_id;
    }
    const role = req?.user ? req.user?.role : null;
    if (!role) {
      return next(new ApiError(401, "Unauthorized"));
    }

    if (role === USER_ROLE.unitLead) {
      filter.unit_id = req?.user && req.user?.unit && req.user.unit._id;
    }
    const institutes = await getInstitutesService(filter);
    res.json(new ApiResponse(200, institutes));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}

export async function deleteInstitute(req, res, next) {
  try {
    const { institute_id } = req.params;
    if (!institute_id) {
      return next(new ApiError(400, "Institute ID is required"));
    }
    const institute = await deleteInstituteService(institute_id);
    res.json(new ApiResponse(200, institute));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}

export async function updateInstitute(req, res, next) {
  try {
    const { institute_id } = req.params;
    if (!institute_id) {
      return next(new ApiError(400, "Institute ID is required"));
    }
    const {
      name,
      address,
      contact,
      email,
      institute_head_id,
      region_id,
      unit_id,
    } = req.body;
    let updateInstituteObject = {
      name,
      address,
      contact,
      email,
      institute_head_id,
      region_id,
      unit_id,
    };
    updateInstituteObject = createNotNullObject(updateInstituteObject);
    if (Object.keys(updateInstituteObject).length === 0) {
      return next(
        new ApiError(400, "At least one field is required to update"),
      );
    }
    const institute = await updateInstituteService(
      institute_id,
      updateInstituteObject,
    );
    res.json(new ApiResponse(200, institute));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}
