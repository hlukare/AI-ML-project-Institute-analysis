import Image from "../../models/image.model.js";

const getImageAnalysis = async (institute_id) => {
  const images = await Image.find({
    analysis: { $exists: true },
    institute_id,
  });

  const impairment_analysis = images.reduce(
    (acc, curr) => {
      acc["Hearing Impairment"] +=
        curr.analysis.impairment_analysis["Hearing Impairment"] / images.length;
      acc["Normal Students"] +=
        curr.analysis.impairment_analysis["Normal Students"] / images.length;
      acc["Physical Disability"] +=
        curr.analysis.impairment_analysis["Physical Disability"] /
        images.length;
      acc["Visual Impairment"] +=
        curr.analysis.impairment_analysis["Visual Impairment"] / images.length;
      return acc;
    },
    {
      "Hearing Impairment": 0,
      "Normal Students": 0,
      "Physical Disability": 0,
      "Visual Impairment": 0,
    },
  );
  console.log("Image Analysis: ", impairment_analysis);
  return impairment_analysis;
};

export default getImageAnalysis;
