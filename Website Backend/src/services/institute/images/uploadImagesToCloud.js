import {
  BATCH_SIZE_IMAGE_UPLOAD,
  MAX_CONCURRENT_UPLOADS,
  MAX_TOTAL_CONCURRENT_REQUESTS,
} from "../../../constants.js";
import ApiError from "../../../utils/ApiError.js";
import { uploadFilesToCloudinary } from "../../cloudinary/cloudinaryUploader.js";
import fs from "fs";

export default async function uploadImagesToCloud(imagePaths) {
  try {
    if (!imagePaths || imagePaths.length === 0) {
      throw new ApiError(400, "No files uploaded");
    }

    // Helper function to upload a single batch
    const uploadBatch = async (batch) => {
      try {
        const batchUrls = await uploadFilesToCloudinary(batch);

        // Delete local files after successful upload
        // await Promise.all(batch.map((file) => fs.promises.unlink(file)));

        return batchUrls;
      } catch (error) {
        console.error(`Error uploading batch: ${error.message}`);
        throw new ApiError(error.statusCode || 500, error.message);
      }
    };

    // Split image paths into batches
    const batches = [];
    for (let i = 0; i < imagePaths.length; i += BATCH_SIZE_IMAGE_UPLOAD) {
      batches.push(imagePaths.slice(i, i + BATCH_SIZE_IMAGE_UPLOAD));
    }

    // Process batches with concurrency control
    const imageUrls = [];
    const activeBatchPromises = [];

    for (const batch of batches) {
      // Start uploading the batch and track the promise
      const batchPromise = uploadBatch(batch);
      activeBatchPromises.push(batchPromise);

      // If the number of active promises reaches the limit, wait for one to finish
      if (activeBatchPromises.length >= MAX_TOTAL_CONCURRENT_REQUESTS) {
        const completedBatchUrls = await Promise.race(activeBatchPromises);
        imageUrls.push(...completedBatchUrls);

        // Remove completed promise from the active queue
        activeBatchPromises.splice(
          activeBatchPromises.findIndex((p) => p === completedBatchUrls),
          1,
        );
      }
    }

    // Wait for any remaining promises to complete
    const remainingResults = await Promise.all(activeBatchPromises);
    remainingResults.forEach((urls) => imageUrls.push(...urls));

    return imageUrls;
  } catch (error) {
    console.error("Error in uploadImagesToCloud:", error.message || error);
    throw new ApiError(error.statusCode || 500, error.message);
  }
}
