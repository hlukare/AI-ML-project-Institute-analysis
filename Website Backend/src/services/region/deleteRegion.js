import Region from "../../models/region.model.js";
import ApiError from "../../utils/ApiError.js";

export default async function deleteRegion(region_id) {
  try {
    if (!region_id) {
      throw new ApiError(400, "Region ID is required");
    }
    const region = await Region.findByIdAndDelete(region_id);
    if (!region) {
      throw new ApiError(400, "Region not found");
    }
    return region;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}
