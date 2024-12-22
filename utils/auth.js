import jwt from "jsonwebtoken";
import ErrorHandler from "./ErrorHandler.js";
import { catchError } from "../middleware/catchAsyncError.js";
import dotenv from "dotenv";
dotenv.config();
import { redis } from "./redis.js";

import mongoose from "mongoose";
import User from "../models/userModel.js";

export const isAuthenticated = catchError(async (req, res, next) => {
  try {
    const access_token = req.cookies.access_token;

    if (!access_token) {
      return next(new ErrorHandler("Please login to access this route", 400));
    }

    const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET);

    if (!decoded) {
      return next(new ErrorHandler("Access token is not valid", 400));
    }

    // Retrieve the user from the database
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorHandler("User not found", 400));
    }

    req.user = user;

    next();
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});
// validate user role

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role || " ")) {
      return next(
        new ErrorHandler("You don't have permission to access this route", 403)
      );
    }
    next();
  };
};
