import User from "../../models/user.model.js";
import Institute from "../../models/institute.model.js";
import Region from "../../models/region.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { USER_ROLE } from "../../constants.js";
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    console.log("email", email);
    console.log("password", password);
    if (!email || !password) {
      res.clearCookie("refreshToken", { httpOnly: true });
      return next(new ApiError(400, "Email and password are required"));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      res.clearCookie("refreshToken", { httpOnly: true });
      return next(new ApiError(401, "Invalid email or password"));
    }

    if (user.status !== "Active") {
      res.clearCookie("refreshToken", { httpOnly: true });
      return next(new ApiError(401, "User is not active"));
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    const loginUser = { ...user._doc };
    loginUser.password = undefined;
    user.refreshToken = refreshToken;

    await user.save();

    const response = {
      accessToken,
      refreshToken,
      user: loginUser,
      role: user.role,
      name: user.name,
      email: user.email,
    };
    if (user.role == USER_ROLE.instituteHead) {
      const institute = await Institute.findOne({
        institute_head_id: user._id,
      });

      if (!institute) {
        response.user.institute = null;
      } else {
        response.user.institute = institute;
      }
    } else if (user.role == USER_ROLE.regionLead) {
      const region = await Region.findOne({
        region_lead_id: user._id,
      });

      if (!region) {
        response.user.region = null;
      } else {
        response.user.region = region;
      }
    }

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production" ? true : false,
    });
    res.json(new ApiResponse(200, response));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}
export { login };
