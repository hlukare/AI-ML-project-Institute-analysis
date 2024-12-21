import Region from "../../models/region.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import registerRegionService from "../../services/region/registerRegion.js";
import assignRegionLeadService from "../../services/region/assignRegionLead.js";
import {
  getRegions as getRegionsService,
  getRegionById as getRegionByIdService,
} from "../../services/region/getRegion.js";
import updateRegionService from "../../services/region/updateRegion.js";
import deleteRegionService from "../../services/region/deleteRegion.js";
import createNotNullObject from "../../utils/createNotNullObject.js";
export async function registerRegion(req, res, next) {
  try {
    const { name, region_lead_id } = req.body;

    if (!name) {
      return next(new ApiError(400, "Name is required"));
    }
    if (!region_lead_id) {
      return next(new ApiError(400, "Region lead ID is required"));
    }

    const region = await registerRegionService(name, region_lead_id);

    res.json(new ApiResponse(200, region));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}

export async function getRegions(req, res, next) {
  try {
    const regions = await getRegionsService();
    res.json(new ApiResponse(200, regions));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}

export async function getRegionById(req, res, next) {
  try {
    const { region_id } = req.params;
    if (!region_id) {
      return next(new ApiError(400, "Region ID is required"));
    }
    const region = await getRegionByIdService(region_id);

    res.json(new ApiResponse(200, region));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}

export async function assignRegionLead(req, res, next) {
  try {
    const { region_id, region_lead_id } = req.body;

    if (!region_id || !region_lead_id) {
      return next(new ApiError(400, "Region ID and Lead ID are required"));
    }

    const region = await assignRegionLeadService(region_id, region_lead_id);

    res.json(new ApiResponse(200, region));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}

export async function updateRegion(req, res, next) {
  try {
    const { region_id } = req.params;
    if (!region_id) {
      return next(new ApiError(400, "Region ID is required"));
    }
    const { name, region_lead_id } = req.body;
    let updateRegionObject = {};
    updateRegionObject = {
      name,
      region_lead_id,
    };
    updateRegionObject = createNotNullObject(updateRegionObject);
    if (Object.keys(updateRegionObject).length === 0) {
      return next(
        new ApiError(400, "At least one field is required to update"),
      );
    }
    const region = await updateRegionService(region_id, updateRegionObject);
    res.json(new ApiResponse(200, region));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}

export async function deleteRegion(req, res, next) {
  try {
    const { region_id } = req.params;
    if (!region_id) {
      return next(new ApiError(400, "Region ID is required"));
    }
    const region = await deleteRegionService(region_id);
    res.json(new ApiResponse(200, region));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}
