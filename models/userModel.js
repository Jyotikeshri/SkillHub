import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";

// Regular expression for email validation
const emailRegexPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Define the User schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: ["true", "Please enter a name"],
    },
    email: {
      type: String,
      required: ["true", "Please enter a email"],
      match: [emailRegexPattern, "Please enter a valid email address"], // Email regex pattern for validation
      unique: true, // Ensure unique email
    },
    password: {
      type: String,

      minlength: 6,
    },
    avatar: {
      public_id: { type: String },
      url: { type: String },
    },
    role: {
      type: String,
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    courses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course", // Reference to a Course model
        },
      },
    ],
  },
  { timestamps: true }
);

// Method to compare passwords
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Token signing methods
userSchema.methods.signAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN_SECRET || " ", {
    expiresIn: "5m",
  });
};

userSchema.methods.signRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || " ", {
    expiresIn: "7d",
  });
};

// Hash password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // If password hasn't changed, no need to hash
  const salt = await bcrypt.genSalt(10); // Generate salt with a cost factor of 10
  this.password = await bcrypt.hash(this.password, salt); // Hash the password
  next();
});

// Create the User model
const User = mongoose.model("User", userSchema);

export default User;
