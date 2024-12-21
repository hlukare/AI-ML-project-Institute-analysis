import cloudinaryInstance from "../../config/cloudinary.js";
export const cloudinaryPDFUpload = async (filePath) => {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      return reject(new Error("Invalid file path"));
    }
    cloudinaryInstance.uploader.upload(
      filePath,
      { folder: "uploads/documents" },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      },
    );
  });
};
