import Image from "../../../models/image.model.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import fs from "fs";
import uploadImagesToCloud from "../../../services/institute/images/uploadImagesToCloud.js";
import deleteFromCloudinary from "../../../services/cloudinary/deleteFromCloudinary.js";
import { IMAGE_STATUS } from "../../../constants.js";
import axios from "axios";
import FormData from "form-data";
import Institute from "../../../models/institute.model.js";
import config from "../../../config/config.js";
export async function uploadImages(req, res, next) {
  let imagePaths;
  const operation = req.query.operation;
  try {
    if (!req.files || req.files.length === 0) {
      return next(new ApiError(400, "No files uploaded"));
    }
    const { institute_id, course_id } = req.params;
    if (!institute_id || !course_id) {
      return next(new ApiError(400, "Institute ID and Course ID are required"));
    }

    imagePaths = req.files.map((file) => file.path);

    //Upload Images to Cloud
    const imageUrls = await uploadImagesToCloud(imagePaths);

    //Save Image URLs to DB
    const uploadedImages = await Image.create({
      institute_id,
      course_id,
      images: imageUrls,
    });
    console.log("Uploaded Images Count ", imageUrls.length);
    const timeTakenToUpload = Date.now() - req.requestTime;
    console.log("Total Time Taken: ", timeTakenToUpload);

    // UPLOAD IMAGES FOR ANALYSIS

    const formData = new FormData();
    // Append all files from req.files to the formData object
    imagePaths.forEach((file) => {
      formData.append("images", fs.createReadStream(file)); // Read files as streams
    });

    // Send the POST request to the external endpoint
    const response = await axios.post(`${config.AI_URL}/score`, formData, {
      headers: formData.getHeaders(), // Use form-data's getHeaders method
    });
    const analysis = await response.data;
    // await Promise.all(imagePaths.map((file) => fs.promises.unlink(file)));

    uploadedImages.analysis = analysis;
    console.log("Analysis: ", analysis);

    uploadedImages.status = IMAGE_STATUS.analysed;
    await uploadedImages.save();

    //Update Institute
    const institute = await Institute.findById(institute_id);
    const { best_classroom_activity: activity } = analysis;
    const activityExists = institute.activityAnalysis.some(
      (act) => act.activity === activity,
    );

    if (activityExists) {
      // Increment count if the activity is found
      await Institute.findOneAndUpdate(
        {
          _id: institute_id,
          "activityAnalysis.activity": activity,
        },
        { $inc: { "activityAnalysis.$.count": 1 } },
      );
    } else {
      // Push new activity if not found
      institute.activityAnalysis.push({
        activity: activity,
        count: 1,
      });
      await institute.save();
    }

    //Delete Images from Cloud
    const deleteStartTime = Date.now();
    const deletedImages = await deleteFromCloudinary(imageUrls);
    console.log("Deleted Images Count ", Object.keys(deletedImages).length);
    const timeTakenToDelete = Date.now() - deleteStartTime;
    console.log("Total Time Taken: ", timeTakenToDelete);

    //Delete images object from DB from Database
    uploadedImages.images = [];
    await uploadedImages.save();
    return res.json(new ApiResponse(200, analysis));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}

// TODO: ADD a queue for image analysis and then delete images from cloud
