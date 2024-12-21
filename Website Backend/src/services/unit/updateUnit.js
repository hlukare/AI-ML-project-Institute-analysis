import Region from "../../models/region.model.js";
import Unit from "../../models/unit.model.js";
import ApiError from "../../utils/ApiError.js";

export default async function updateUnitService(unit_id, updateUnitObject) {
  try {
    if (!unit_id) {
      throw new ApiError(400, "Unit ID is required");
    }
    const unit = await Unit.findOne({
      _id: unit_id,
    });
    if (!unit) {
      throw new ApiError(400, "Unit not found");
    }
    if (updateUnitObject.region_id) {
      const region = await Unit.findById(updateUnitObject.region_id);
      if (!region) {
        throw new ApiError(400, "Region not found");
      }
    }
    unit.set(updateUnitObject);
    await unit.save();

    return unit;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}
