import Region from "../../models/region.model.js";
import User from "../../models/user.model.js";
import ApiError from "../../utils/ApiError.js";
import { USER_ROLE } from "../../constants.js";
export default async function assignRegionLead(region_id, region_lead_id) {
  try {
    if (!region_id || !region_lead_id) {
      throw new ApiError(400, "Region ID and Lead ID are required");
    }
    const region = await Region.findOne({ _id: region_id });
    if (!region) {
      throw new ApiError(400, "Region not found");
    }
    const regionLead = await User.findOne({ _id: region_lead_id });
    if (!regionLead) {
      throw new ApiError(400, "Region lead not found");
    }
    if (regionLead.role !== USER_ROLE.regionLead) {
      throw new ApiError(400, "User is not a region lead");
    }
    const regionLeadExists = await Region.findOne({
      region_lead_id: region_lead_id,
    });
    if (regionLeadExists) {
      throw new ApiError(400, "Region lead is already assigned to a region");
    }

    region.region_lead_id = region_lead_id;
    await region.save();
    return region;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}
