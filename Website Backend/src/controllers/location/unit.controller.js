import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import registerUnitService from "../../services/unit/registerUnit.js";
import assignUnitLeadService from "../../services/unit/assignUnitLead.js";
import {
  getUnits as getUnitsService,
  getUnitById as getUnitByIdService,
} from "../../services/unit/getUnit.js";
import deleteUnitService from "../../services/unit/deleteUnit.js";
import updateUnitService from "../../services/unit/updateUnit.js";
import createNotNullObject from "../../utils/createNotNullObject.js";
import { USER_ROLE } from "../../constants.js";

// Registers a new unit
export async function registerUnit(req, res, next) {
  try {
    const { name, region_id, unit_lead_id } = req.body;

    if (!name || !region_id || !unit_lead_id) {
      return next(
        new ApiError(400, "Name, Region ID and Unit Lead ID are required"),
      );
    }

    const unit = await registerUnitService(name, region_id, unit_lead_id);

    res.json(new ApiResponse(200, unit));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}

// Retrieves all units
export async function getUnits(req, res, next) {
  try {
    const query = req.query;
    const userRole = req.user && req.user?.role;
    if (!userRole) {
      return next(new ApiError(400, "User role is required"));
    }

    if (userRole === USER_ROLE.regionLead) {
      query.region_id = req.user && req.user.region && req.user.region._id;
    }

    const role = req?.user ? req.user?.role : null;
    if (!role) {
      return next(new ApiError(400, "Role is required"));
    }
    const units = await getUnitsService(query);
    res.json(new ApiResponse(200, units));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}

// Retrieves a unit by ID
export async function getUnitById(req, res, next) {
  try {
    const { unit_id } = req.params;
    const unit = await getUnitByIdService(unit_id);
    res.json(new ApiResponse(200, unit));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}

// Assigns a lead to a unit
export async function assignUnitLead(req, res, next) {
  try {
    const { unit_id, unit_lead_id } = req.body;

    if (!unit_id || !unit_lead_id) {
      return next(new ApiError(400, "Unit ID and Lead ID are required"));
    }

    const unit = await assignUnitLeadService(unit_id, unit_lead_id);

    res.json(new ApiResponse(200, unit));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}

// Updates a unit
export async function updateUnit(req, res, next) {
  try {
    const { unit_id } = req.params;
    if (!unit_id) {
      return next(new ApiError(400, "Unit ID is required"));
    }
    const { name, region_id, unit_lead_id } = req.body;
    let updateUnitObject = {
      name,
      region_id,
      unit_lead_id,
    };
    updateUnitObject = createNotNullObject(updateUnitObject);
    if (Object.keys(updateUnitObject).length === 0) {
      return next(
        new ApiError(400, "At least one field is required to update"),
      );
    }
    const unit = await updateUnitService(unit_id, updateUnitObject);
    res.json(new ApiResponse(200, unit));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}

// Deletes a unit
export async function deleteUnit(req, res, next) {
  try {
    const { unit_id } = req.params;
    if (!unit_id) {
      return next(new ApiError(400, "Unit ID is required"));
    }
    const unit = await deleteUnitService(unit_id);
    res.json(new ApiResponse(200, unit));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}
