import cloudinaryInstance from "../../config/cloudinary.js";
import {
  BATCH_SIZE_IMAGE_UPLOAD,
  MAX_CONCURRENT_DELETIONS,
  MAX_TOTAL_CONCURRENT_REQUESTS,
} from "../../constants.js";
import ApiError from "../../utils/ApiError.js";

// Function to delete files from Cloudinary in batches
export default async function deleteFilesFromCloudinary(urls) {
  try {
    // Filter valid URLs
    const validUrls = urls.filter((url) => url && typeof url === "string");

    // Helper function to extract the public ID from a Cloudinary URL
    const extractPublicId = (url) => {
      try {
        let publicId = url.split("/upload/")[1]?.split(".")[0];
        if (!publicId) throw new Error("Invalid publicId");

        // Remove version number if present
        if (
          publicId.startsWith("v") &&
          !isNaN(publicId.slice(1, publicId.indexOf("/")))
        ) {
          publicId = publicId.slice(publicId.indexOf("/") + 1);
        }

        return publicId;
      } catch (error) {
        return null; // Return null for invalid URLs
      }
    };

    // Map URLs to public IDs, filtering out invalid ones
    const publicIds = validUrls
      .map(extractPublicId)
      .filter((publicId) => publicId !== null);

    // Function to delete a single file
    const deleteFile = async (publicId) => {
      try {
        const result = await cloudinaryInstance.uploader.destroy(publicId);
        if (result.result !== "ok") {
          throw new Error(
            `Cloudinary deletion failed for publicId: ${publicId}`,
          );
        }
        return { publicId, status: "deleted" };
      } catch (error) {
        console.error(
          `Error deleting publicId ${publicId}:`,
          error.message || error,
        );
        return {
          publicId,
          status: "error",
          error: error.message || "Unknown error",
        };
      }
    };

    // Function to process deletions in batches with concurrency control
    const processDeletions = async () => {
      const results = [];
      const activePromises = [];

      for (const publicId of publicIds) {
        // Start deleting and track the promise
        const promise = deleteFile(publicId);
        activePromises.push(promise);

        // If the number of active promises reaches the limit, wait for one to finish
        if (activePromises.length >= MAX_TOTAL_CONCURRENT_REQUESTS) {
          const completedPromise = await Promise.race(activePromises);
          results.push(completedPromise);
          activePromises.splice(activePromises.indexOf(completedPromise), 1); // Remove the completed promise
        }
      }

      // Wait for any remaining promises to complete
      const remainingResults = await Promise.all(activePromises);
      results.push(...remainingResults);

      return results;
    };

    // Process deletions in batches
    const allResults = await processDeletions();

    // Log failed deletions
    const failedDeletions = allResults.filter(
      (result) => result.status === "error",
    );
    if (failedDeletions.length) {
      console.error("Failed deletions:", failedDeletions);
    }

    return allResults;
  } catch (error) {
    console.error(
      "Error in deleteFilesFromCloudinary:",
      error.message || error,
    );
    throw new ApiError(error.statusCode || 500, error.message);
  }
}
