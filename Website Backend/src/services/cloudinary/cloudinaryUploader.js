import fs from "fs";
import retry from "../../utils/retryLogic.js";
import { UPLOAD_FOLDER } from "../../constants.js";
import cloudinaryInstance from "../../config/cloudinary.js";

// Upload a single file
const uploadToCloudinary = async (filePath) => {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      return reject(new Error("Invalid file path"));
    }

    // Ensure the file exists before uploading
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        return reject(new Error(`File does not exist at path: ${filePath}`));
      }

      // Proceed with Cloudinary upload
      const uploadStream = cloudinaryInstance.uploader.upload_stream(
        { folder: UPLOAD_FOLDER, transformation: [] },
        (error, result) => {
          if (error) {
            return reject(error); // Pass the error if any
          }
          resolve(result.secure_url); // Return Cloudinary URL
        },
      );

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(uploadStream);

      fileStream.on("error", (err) => reject(err)); // Handle errors during stream
    });
  });
};

// Upload multiple files in parallel with retries
export const uploadFilesToCloudinary = async (files) => {
  const results = await Promise.all(
    files.map(
      (file) => retry(() => uploadToCloudinary(file), 3), // Retry 3 times
    ),
  );
  return results;
};
