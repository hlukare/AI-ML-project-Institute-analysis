import Institute from "../../models/institute.model.js";

export const getInstituteAnalysis = async (instituteId) => {
  const institute = await Institute.findById(instituteId);

  const analysis = institute?.activityAnalysis;
  return analysis;
};

export default getInstituteAnalysis;
