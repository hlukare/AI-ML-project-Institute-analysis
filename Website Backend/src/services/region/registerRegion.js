import { USER_ROLE } from "../../constants.js";
import Region from "../../models/region.model.js";
import User from "../../models/user.model.js";
import ApiError from "../../utils/ApiError.js";

export default async function registerRegion(name, region_lead_id) {
  try {
    if (!name) {
      throw new ApiError(400, "Name is required");
    }
    if (!region_lead_id) {
      throw new ApiError(400, "Region Lead ID is required");
    }
    const regionExists = await Region.findOne({ name });
    if (regionExists) {
      throw new ApiError(400, "Region already exists");
    }
    const userExists = await User.findOne({ _id: region_lead_id });
    if (!userExists) {
      throw new ApiError(400, "Region lead not found");
    }
    if (userExists.role !== USER_ROLE.regionLead) {
      throw new ApiError(400, "User is not a region lead");
    }
    const region = await Region.create({ name, region_lead_id });
    return region;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}
