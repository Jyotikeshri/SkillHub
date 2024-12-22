import { catchError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import path from "path";
import ejs from "ejs";
import { fileURLToPath } from "url";
import notificationModel from "../models/notificationModel.js";
import orderModel from "../models/orderModel.js";
import courseModel from "../models/courseModel.js";
import User from "../models/userModel.js";
import sendMail from "../utils/sendMail.js";
import { getAllOrdersService, newOrder } from "../services/orderService.js";

const __filename = fileURLToPath(import.meta.url); // Current file path
const __dirname = path.dirname(__filename);

export const createOrder = catchError(async (req, res, next) => {
  try {
    const { courseId, payment_info } = req.body;
    const user = await User.findById(req.user._id);
    const courseExistInUser = user?.courses?.find(
      (course) => course._id.toString() === courseId
    );
    if (courseExistInUser) {
      return next(new ErrorHandler("Course already purchased", 400));
    }
    const course = await courseModel.findById(courseId);
    if (!course) {
      return next(new ErrorHandler("Course doesn't exist", 400));
    }
    const data = {
      courseId: course._id,
      userId: user._id,
      payment_info,
    };

    const mailData = {
      order: {
        courseId: course._id,
        name: course.name,
        price: course.price,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      },
    };
    const html = await ejs.renderFile(
      path.join(__dirname, "../mails/orderConfirmation.ejs"),
      mailData
    );
    try {
      await sendMail({
        email: user.email,
        subject: "Order Confirmation",
        template: "orderConfirmation.ejs",
        data: mailData,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
    user?.courses?.push(courseId);
    await user.save();
    const notification = await notificationModel.create({
      user: user._id,
      title: "New Order",
      message: `You have purchased ${course.name} course`,
    });
    course.purchased ? (course.purchased += 1) : course.purchased;
    await course.save();
    newOrder(data, res, next);
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const getAllOrdersForAdmin = catchError(async (req, res, next) => {
  try {
    getAllOrdersService(res);
  } catch (error) {
    return next(new ErrorHandler(error.message, 400)); // Catch any errors
  }
});
