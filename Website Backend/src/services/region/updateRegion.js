import Region from "../../models/region.model.js";
import ApiError from "../../utils/ApiError.js";

export default async function updateRegion(
  region_id,
  { name, region_lead_id },
) {
  try {
    if (!region_id || !name) {
      throw new ApiError(400, "Region ID and Name are required");
    }
    const region = await Region.findById({ _id: region_id });
    if (!region) {
      throw new ApiError(400, "Region not found");
    }
    if (name) {
      region.name = name;
    }
    if (region_lead_id) {
      region.region_lead_id = region_lead_id;
    }
    await region.save();
    return region;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}
