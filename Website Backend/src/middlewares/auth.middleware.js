import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";
import jsonwebtoken from "jsonwebtoken";
import config from "../config/config.js";
import { USER_ROLE } from "../constants.js";
import Region from "../models/region.model.js";
import Unit from "../models/unit.model.js";
import Institute from "../models/institute.model.js";

const authMiddleware = async (req, res, next) => {
  if (config.NODE_ENV === "test") {
    return next();
  }
  const authHeader = req.headers.authorization;
  const accessToken = authHeader && authHeader.split(" ")[1];
  if (!accessToken) {
    return next(new ApiError(401, "Access token is required"));
  }
  try {
    const decoded = jsonwebtoken.verify(
      accessToken,
      config.ACCESS_TOKEN_SECRET,
    );
    const user = await User.findById(decoded._id);
    if (!user) {
      return next(new ApiError(401, "User not found"));
    }
    req.user = user;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return next(new ApiError(401, "Refresh token is required"));
      }
      try {
        const refreshDecoded = jsonwebtoken.verify(
          refreshToken,
          config.REFRESH_TOKEN_SECRET,
        );
        const user = await User.findById(refreshDecoded._id);
        if (!user) {
          return next(new ApiError(401, "User not found"));
        }
        const newAccessToken = await user.generateAccessToken();
        res.setHeader("Authorization", newAccessToken);
        req.user = user;
      } catch (refreshError) {
        return next(new ApiError(401, "Invalid refresh token"));
      }
    } else {
      return next(new ApiError(401, "Invalid access token"));
    }
  }
  try {
    const user = req.user;

    if (user.role == USER_ROLE.regionLead) {
      req.user.region = await Region.findOne({ region_lead_id: user._id });
    } else if (user.role == USER_ROLE.unitLead) {
      req.user.unit = await Unit.findOne({ unit_lead_id: user._id });
    } else if (user.role == USER_ROLE.instituteHead) {
      req.user.institute = await Institute.findOne({
        institute_head_id: user._id,
      });
    }
    return next();
  } catch (error) {
    return next(new ApiError(500, "Internal server error"));
  }
};

const authRoleMiddleware = (roles) => {
  return async (req, res, next) => {
    if (config.NODE_ENV === "test") {
      return next();
    }
    try {
      const user = req.user;
      if (!user) {
        return next(new ApiError(401, "User not found"));
      }
      if (!roles.includes(user.role)) {
        return next(new ApiError(403, "Access denied"));
      }
      next();
    } catch (error) {
      return next(new ApiError(500, "Internal server error"));
    }
  };
};
export { authMiddleware, authRoleMiddleware };
