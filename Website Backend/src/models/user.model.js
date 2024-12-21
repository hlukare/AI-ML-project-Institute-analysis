import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import config from "../config/config.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      validate: [
        {
          validator: function (v) {
            return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
          },
          message: (props) => `${props.value} is not a valid email!`,
        },
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      minlength: [8, "Password must be at least 8 characters"],
      validate: [
        {
          validator: function (v) {
            return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/.test(v);
          },
          message: (props) =>
            `${props.value} does not match the password policy!`,
        },
      ],
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: [
          "SuperAdmin",
          "RegionLead",
          "UnitLead",
          "InstituteHead",
          "Teacher",
        ],
        message: (props) => `${props.value} is not a valid role!`,
      },
    },
    degrees: {
      type: [String],
    },
    experience: {
      type: Number,
    },
    institute_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["Active", "Inactive"],
        message: (props) => `${props.value} is not a valid status!`,
      },
      default: "Active",
    },
    last_login: {
      type: Date,
      default: null,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Password encryption
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Password comparison
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate Access Token
userSchema.methods.generateAccessToken = async function () {
  return jsonwebtoken.sign(
    {
      _id: this._id,
      email: this.email,
      role: this.role,
      institute_id: this.institute_id,
    },
    config.ACCESS_TOKEN_SECRET,
    { expiresIn: config.ACCESS_TOKEN_EXPIRY },
  );
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = async function () {
  return jsonwebtoken.sign(
    {
      _id: this._id,
    },
    config.REFRESH_TOKEN_SECRET,
    { expiresIn: config.REFRESH_TOKEN_EXPIRY },
  );
};

const User = mongoose.model("User", userSchema);
export default User;
