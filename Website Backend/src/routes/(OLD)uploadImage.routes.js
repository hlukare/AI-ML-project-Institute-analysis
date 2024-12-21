import express from "express";
import uploadImage from "../middlewares/multer/bulkImageUpload.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { MAX_IMAGES_UPLOAD } from "../constants.js";
const router = express.Router();

router.post("/upload", uploadImage.array("images", MAX_IMAGES_UPLOAD), (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(new ApiError(400, "No files uploaded"));
    }
    const imageUrls = req.files.map((file) => file.path); // Cloudinary URLs
    console.log(imageUrls);
    return res.json(new ApiResponse(200, imageUrls));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
});

export default router;
