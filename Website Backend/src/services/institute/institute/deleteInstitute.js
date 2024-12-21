import Institute from "../../../models/institute.model.js";
import ApiError from "../../../utils/ApiError.js";

export default async function deleteInstitute(institute_id) {
  if (!institute_id) {
    throw new ApiError(400, "Institute ID is required");
  }
  const institute = await Institute.findByIdAndDelete(institute_id);
  if (!institute) {
    throw new ApiError(404, "Institute not found");
  }
  return institute;
}
