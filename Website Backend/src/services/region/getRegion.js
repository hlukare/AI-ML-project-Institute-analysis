import Region from "../../models/region.model.js";
import ApiError from "../../utils/ApiError.js";

async function getRegionById(region_id) {
  try {
    if (!region_id) {
      throw new ApiError(400, "Region ID is required");
    }
    const region = await Region.findById(region_id);
    if (!region) {
      throw new ApiError(400, "Region not found");
    }
    return region;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}

async function getRegions() {
  try {
    const regions = await Region.find().populate("region_lead_id");
    const formattedRegions = regions.map((region) => {
      const { region_lead_id, ...rest } = region.toObject();
      return {
        ...rest,
        region_lead: region_lead_id,
      };
    });
    return formattedRegions;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}

export { getRegionById, getRegions };

export default { getRegionById, getRegions };
