import { catchError } from "../middleware/catchAsyncError.js";
import courseModel from "../models/courseModel.js";

export const createCourse = catchError(async (data, res, next) => {
  const course = await courseModel.create(data);
  res
    .status(201)
    .json({ success: true, message: "Course created successfully", course });
});

export const getAllCoursesService = async (res) => {
  const courses = await courseModel.find();
  res.status(200).json({
    success: true,
    courses,
  });
};
