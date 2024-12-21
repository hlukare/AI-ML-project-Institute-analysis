import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getUsers = async (req, res, next) => {
  try {
    const query = req.query;
    const users = await User.find(query);
    res.json(new ApiResponse(200, users));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
};
