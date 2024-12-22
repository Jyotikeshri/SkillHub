import { catchError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import notificationModel from "../models/notificationModel.js";
import cron from "node-cron";

export const getNotifications = catchError(async (req, res, next) => {
  try {
    const notifications = await notificationModel
      .find()
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});
// update notification status

export const updateNotifications = catchError(async (req, res, next) => {
  try {
    const notification = await notificationModel.findById(req.params.id);
    if (!notification) {
      return next(new ErrorHandler("Notification not found", 404));
    } else {
      notification?.status
        ? (notification.status = "read")
        : notification?.status;
      await notification.save();
    }

    const notifications = await notificationModel
      .find()
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

cron.schedule("0 0 0 * * *", async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await notificationModel.deleteMany({
    status: "read",
    createdAt: { $lt: thirtyDaysAgo },
  });
  console.log("deleted all notifications");
});
