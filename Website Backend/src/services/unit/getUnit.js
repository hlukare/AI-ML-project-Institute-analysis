import { query } from "express";
import Unit from "../../models/unit.model.js";
import ApiError from "../../utils/ApiError.js";

async function getUnits(query) {
  try {
    const units = await Unit.find(query)
      .populate({
        path: "region_id",
        populate: {
          path: "region_lead_id", // Populate the region_lead_id field within region_id
        },
      })
      .populate("unit_lead_id");

    const formattedUnits = units.map((unit) => {
      const { region_id, unit_lead_id, ...rest } = unit.toObject();
      const { region_lead_id, ...regionWithoutLeadId } = region_id || {};
      return {
        ...rest,
        region: {
          ...regionWithoutLeadId,
          region_lead: region_lead_id,
        },
        unit_lead: unit_lead_id,
      };
    });
    return formattedUnits;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}

async function getUnitById(unit_id) {
  try {
    if (!unit_id) {
      throw new ApiError(400, "Unit ID is required");
    }
    const unit = await Unit.findById(unit_id);
    if (!unit) {
      throw new ApiError(400, "Unit not found");
    }
    return unit;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}

export { getUnits, getUnitById };
