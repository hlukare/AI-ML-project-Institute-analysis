import { USER_ROLE } from "../../../constants.js";
import Institute from "../../../models/institute.model.js";
import Region from "../../../models/region.model.js";
import Unit from "../../../models/unit.model.js";
import User from "../../../models/user.model.js";
import ApiError from "../../../utils/ApiError.js";

const updateInstituteService = async (institute_id, updateInstituteObject) => {
  try {
    if (!institute_id) {
      throw new ApiError(400, "Institute ID is required");
    }
    const institute = await Institute.findById(institute_id);
    if (!institute) {
      throw new ApiError(400, "Institute not found");
    }
    if (updateInstituteObject.region_id) {
      const region = await Region.findById(updateInstituteObject.region_id);
      if (!region) {
        throw new ApiError(400, "Region not found");
      }
    }
    if (updateInstituteObject.unit_id) {
      const unit = await Unit.findById(updateInstituteObject.unit_id);
      if (!unit) {
        throw new ApiError(400, "Unit not found");
      }
    }
    if (updateInstituteObject.institute_head_id) {
      const user = await User.findById(updateInstituteObject.institute_head_id);
      if (!user) {
        throw new ApiError(400, "User not found");
      }
      if (user.role !== USER_ROLE.instituteHead) {
        throw new ApiError(400, "User is not an Institute Head");
      }
      const instituteHeadExists = await Institute.findOne({
        institute_head_id: user._id,
      });
      if (instituteHeadExists) {
        throw new ApiError(
          400,
          "Institute Head is already assigned to an Institute",
        );
      }
    }
    institute.set(updateInstituteObject);
    await institute.save();
    return institute;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
};

export default updateInstituteService;
