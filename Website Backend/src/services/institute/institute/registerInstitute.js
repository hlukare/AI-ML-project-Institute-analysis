import Region from "../../../models/region.model.js";
import Unit from "../../../models/unit.model.js";
import Institute from "../../../models/institute.model.js";
import ApiError from "../../../utils/ApiError.js";
export default async function registerUnit(
  name,
  address,
  contact,
  email,
  region_id,
  unit_id,
  institute_head_id,
) {
  try {
    if (
      !name ||
      !address ||
      !contact ||
      !email ||
      !region_id ||
      !unit_id ||
      !institute_head_id
    ) {
      throw new ApiError(400, "All fields are required");
    }
    const instituteExists = await Institute.findOne({
      email: email,
    });

    if (instituteExists) {
      throw new ApiError(400, "Institute already exists");
    }

    const newInstitute = {
      name: name,
      address: address,
      contact: contact,
      email: email,
      region_id: region_id,
      unit_id: unit_id,
      institute_head_id: institute_head_id,
    };

    const regionExists = await Region.findOne({
      _id: region_id,
    });

    if (!regionExists) {
      throw new ApiError(400, "Invalid Region ID");
    }

    const unitExists = await Unit.findOne({
      _id: unit_id,
    });

    if (!unitExists) {
      throw new ApiError(400, "Invalid Unit ID");
    }

    const instituteAssigned = await Institute.findOne({
      institute_head_id: institute_head_id,
    });

    if (instituteAssigned) {
      throw new ApiError(
        400,
        "Institute head is already assigned to an institute",
      );
    }

    const institute = await Institute.create(newInstitute);

    return institute;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}
