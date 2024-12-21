import Institute from "../../../models/institute.model.js";
import User from "../../../models/user.model.js";
import { USER_ROLE } from "../../../constants.js";
import ApiError from "../../../utils/ApiError.js";

export default async function assignInstituteHeadService(
  institute_id,
  institute_head_id,
) {
  try {
    if (!institute_id || !institute_head_id) {
      throw new ApiError(400, "Institute ID and Head ID are required");
    }

    const instituteExists = await Institute.findOne({
      _id: institute_id,
    });

    if (!instituteExists) {
      throw new ApiError(400, "Invalid Institute ID");
    }

    const userExists = await User.findOne({
      _id: institute_head_id,
    });

    if (!userExists) {
      throw new ApiError(400, "Invalid Head ID");
    }

    if (userExists.role !== USER_ROLE.instituteHead) {
      throw new ApiError(400, "User is not an Institute Head");
    }

    const instituteHead = await Institute.findOne({
      institute_head_id: userExists._id,
    });
    if (instituteHead) {
      throw new ApiError(
        400,
        "Institute Head Already Assigned to another Institute",
      );
    }
    instituteExists.institute_head_id = institute_head_id;
    await instituteExists.save();
    return instituteExists;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}
