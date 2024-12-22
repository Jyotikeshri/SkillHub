import ErrorHandler from "../utils/ErrorHandler.js";
import { catchError } from "../middleware/catchAsyncError.js";
import { generateLast12MonthsData } from "../utils/analyticsGenerator.js";
import User from "../models/userModel.js";
import courseModel from "../models/courseModel.js";
import orderModel from "../models/orderModel.js";

export const getUserAnalytics = catchError(async (req, res, next) => {
  try {
    const users = await generateLast12MonthsData(User);
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(new ErrorHandler(error.message, 404));
  }
});

export const getCourseAnalytics = catchError(async (req, res, next) => {
  try {
    const courses = await generateLast12MonthsData(courseModel);
    res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    next(new ErrorHandler(error.message, 404));
  }
});

export const getOrderAnalytics = catchError(async (req, res, next) => {
  try {
    const orders = await generateLast12MonthsData(orderModel);
    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(new ErrorHandler(error.message, 404));
  }
});
