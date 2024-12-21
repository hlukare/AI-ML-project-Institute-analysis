import Unit from "../../models/unit.model.js";
import Region from "../../models/region.model.js";
import ApiError from "../../utils/ApiError.js";
export default async function registerUnit(
  name,
  region_id,
  unit_lead_id = null,
) {
  try {
    if (!name || !region_id || !unit_lead_id) {
      throw new ApiError(400, "Name, Region ID and Unit Lead ID are required");
    }

    const regionExists = await Region.findOne({
      _id: region_id,
    });

    if (!regionExists) {
      throw new ApiError(400, "Invalid Region ID");
    }

    const unitExists = await Unit.findOne({
      name: name,
      region_id: region_id,
    });

    if (unitExists) {
      throw new ApiError(400, "Unit already exists");
    }

    const unitObject = {
      name: name,
      region_id: region_id,
    };

    if (unit_lead_id) {
      unitObject.unit_lead_id = unit_lead_id;
    }
    const unit = await Unit.create(unitObject);

    return unit;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}
