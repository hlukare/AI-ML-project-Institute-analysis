import Unit from "../../models/unit.model.js";
import ApiError from "../../utils/ApiError.js";

export default async function deleteUnitService(unit_id) {
  try {
    if (!unit_id) {
      throw new ApiError(400, "Unit ID is required");
    }
    const unit = await Unit.findByIdAndDelete(unit_id);
    if (!unit) {
      throw new ApiError(400, "Unit not found");
    }
    return unit;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}
