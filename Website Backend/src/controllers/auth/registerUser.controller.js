import User from "../../models/user.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { USER_ROLE } from "../../constants.js";
export async function registerUser(req, res, next) {
  try {
    const { name, email, password, role, degrees, experience, institute_id } =
      req.body;
    if (!name || !email || !password || !role) {
      return next(new ApiError(400, "All fields are required"));
    }

    if (!Object.values(USER_ROLE).includes(role)) {
      return next(new ApiError(400, "Invalid role"));
    }

    const userExists = await User.findOne({
      email: email,
    });

    if (userExists && userExists.role !== USER_ROLE.teacher) {
      return next(new ApiError(400, "User already exists"));
    } else if (userExists && userExists.role === USER_ROLE.teacher) {
      if (userExists.institute_id == institute_id) {
        return next(new ApiError(400, "User already exists"));
      }
    }

    if (role == "Teacher" && (!degrees || !experience || !institute_id)) {
      return next(
        new ApiError(400, "Degrees, Experience and Institute ID are required"),
      );
    }

    const newUser = {
      name: name,
      email: email,
      password: String(password),
      role: role,
    };

    if (role == "Teacher") {
      newUser.degrees = degrees;
      newUser.experience = experience;
      newUser.institute_id = institute_id;
    }
    const user = await User.create(newUser);

    res.json(new ApiResponse(200, user));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}
