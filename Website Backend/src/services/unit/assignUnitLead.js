import Unit from "../../models/unit.model.js";
import User from "../../models/user.model.js";
import { USER_ROLE } from "../../constants.js";
import ApiError from "../../utils/ApiError.js";

export default async function assignUnitLeadService(unit_id, unit_lead_id) {
  try {
    if (!unit_id || !unit_lead_id) {
      throw new ApiError(400, "Unit ID and Lead ID are required");
    }
    const unit = await Unit.findById(unit_id);

    if (!unit) {
      throw new ApiError(400, "Invalid Unit ID or Lead ID");
    }

    const unit_lead = await User.findById(unit_lead_id);

    if (!unit_lead) {
      throw new ApiError(400, "Invalid Unit ID or Lead ID");
    }

    if (unit_lead.role !== USER_ROLE.unitLead) {
      throw new ApiError(400, "User is not a unit lead");
    }

    const unitLead = await Unit.findOne({
      unit_lead_id: unit_lead_id,
    });

    if (unitLead) {
      throw new ApiError(400, "Unit lead is already assigned to a unit");
    }

    unit.unit_lead_id = unit_lead_id;
    await unit.save();
    return unit;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}
