import Institute from "../../../models/institute.model.js";
import Unit from "../../../models/unit.model.js";
import Region from "../../../models/region.model.js";
import ApiError from "../../../utils/ApiError.js";
export async function getInstituteById(institute_id) {
  try {
    if (!institute_id) {
      throw new ApiError(400, "Institute ID is required");
    }
    const institute = await Institute.findById(institute_id);
    if (!institute) {
      throw new ApiError(400, "Institute not found");
    }
    return institute;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}
export async function getInstitutes(filters) {
  try {
    const institutes = await Institute.find(filters)
      .populate({
        path: "unit_id",
        populate: {
          path: "unit_lead_id", // Populate nested unit_lead_id within unit_id
        },
      })
      .populate({
        path: "region_id",
        populate: {
          path: "region_lead_id", // Populate nested region_lead_id within region_id
        },
      })
      .populate("institute_head_id");

    const formattedInstitutes = institutes.map((institute) => {
      const { unit_id, region_id, institute_head_id, ...rest } =
        institute.toObject();
      const { unit_lead_id, ...unitWithoutLeadId } = unit_id || {};
      const { region_lead_id, ...regionWithoutLeadId } = region_id || {};

      return {
        ...rest,
        unit: {
          ...unitWithoutLeadId,
          unit_lead: unit_lead_id,
        },
        region: {
          ...regionWithoutLeadId,
          region_lead: region_lead_id,
        },
        institute_head: institute_head_id,
      };
    });

    return formattedInstitutes;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}
