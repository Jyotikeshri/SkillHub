import { catchError } from "../middleware/catchAsyncError.js";
import orderModel from "../models/orderModel.js";

export const newOrder = catchError(async (data, res, next) => {
  const order = await orderModel.create(data);
  return res.status(200).json({
    success: true,
    order,
    message: "Course purchased successfully",
  });
});

export const getAllOrdersService = async (res) => {
  const orders = await orderModel.find();
  res.status(200).json({
    success: true,
    orders,
  });
};
