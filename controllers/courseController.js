import { catchError } from "../middleware/catchAsyncError.js";
import courseModel from "../models/courseModel.js";
import {
  createCourse,
  getAllCoursesService,
} from "../services/courseService.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import cloudinary from "cloudinary";
import { redis } from "../utils/redis.js";
import { fileURLToPath } from "url";
import path from "path";
import ejs from "ejs";
import mongoose from "mongoose";
import sendMail from "../utils/sendMail.js";
import notificationModel from "../models/notificationModel.js";

const __filename = fileURLToPath(import.meta.url); // Current file path
const __dirname = path.dirname(__filename);

export const uploadCourse = catchError(async (req, res, next) => {
  try {
    const data = req.body;
    const thumbnail = data.thumbnail;

    if (thumbnail) {
      const mycloud = await cloudinary.v2.uploader.upload(thumbnail.url, {
        folder: "courses",
      });
      data.thumbnail = {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      };
    }

    await createCourse(data, res, next);
  } catch (error) {
    console.error("Error in uploadCourse:", error.message);
    return next(new ErrorHandler(error.message, 400));
  }
});

export const editCourse = catchError(async (req, res, next) => {
  try {
    const data = req.body;
    const thumbnail = data.thumbnail;
    if (thumbnail) {
      if (thumbnail.public_id) {
        await cloudinary.v2.uploader.destroy(thumbnail?.public_id);
      }
      const mycloud = await cloudinary.v2.uploader.upload(thumbnail.url, {
        folder: "courses",
      });
      data.thumbnail = {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      };
    }
    const courseId = req.params.id;
    const course = await courseModel.findByIdAndUpdate(
      courseId,
      {
        $set: data,
      },
      {
        new: true,
      }
    );
    res.status(200).json({ success: true, course });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// get single course without purchasing
export const getSingleCourse = catchError(async (req, res, next) => {
  try {
    const courseId = req.params.id;

    const course = await courseModel
      .findById(req.params.id)
      .select(
        "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
      );

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// get all courses without purchasing
export const getAllCourses = catchError(async (req, res, next) => {
  try {
    const courses = await courseModel
      .find()
      .select(
        "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
      );

    res.status(200).json({ success: true, courses });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// get course for valid user
export const getCourseForValidUser = catchError(async (req, res, next) => {
  try {
    const userCourseList = req.user?.courses;
    const courseId = req.params.id;
    const courseExist = userCourseList?.find(
      (c) => c._id.toString() === courseId
    );
    if (!courseExist) {
      return next(
        new ErrorHandler("You are not eligible to access this course", 400)
      );
    }
    const course = await courseModel.findById(courseId);
    const content = course?.courseData;

    res.status(200).json({ success: true, content });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// create question in course
export const createQuestion = catchError(async (req, res, next) => {
  try {
    const { question, courseId, contentId } = req.body;
    const course = await courseModel.findById(courseId);
    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return next(new ErrorHandler("Invalid content id", 400));
    }
    const courseContent = await course?.courseData?.find((item) =>
      item._id.equals(contentId)
    );
    if (!courseContent) {
      return next(new ErrorHandler("Invalid content id", 400));
    }
    const questionExist = courseContent?.questions?.find(
      (q) => q.question === question
    );
    if (questionExist) {
      return next(new ErrorHandler("Question already exists", 400));
    }
    const newQuestion = {
      user: req.user,
      question,
      questionReplies: [],
    };
    courseContent.questions.push(newQuestion);
    await notificationModel.create({
      user: req.user._id,
      title: "New Question",
      message: `You have a new question in ${courseContent?.title} `,
    });
    await course.save();
    res.status(201).json({ success: true, course });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// add answer to question
export const addAnswer = catchError(async (req, res, next) => {
  try {
    const { answer, courseId, contentId, questionId } = req.body;
    const course = await courseModel.findById(courseId);
    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return next(new ErrorHandler("Invalid content id", 400));
    }
    const courseContent = await course?.courseData?.find((item) =>
      item._id.equals(contentId)
    );
    if (!courseContent) {
      return next(new ErrorHandler("Invalid content id", 400));
    }
    const questionExist = courseContent?.questions?.find(
      (q) => q._id.toString() === questionId
    );
    if (!questionExist) {
      return next(new ErrorHandler("Question doesn't exists", 400));
    }
    const newAnswer = {
      user: req.user,
      answer,
    };
    questionExist.questionReplies.push(newAnswer);
    await course.save();

    if (req.user._id === questionExist.user._id) {
      await notificationModel.create({
        user: req.user._id,
        title: "New Question Reply Received",
        message: `You have a new question reply in ${courseContent?.title} `,
      });
    } else {
      const data = {
        name: questionExist.user.name,
        title: courseContent.title,
      };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/questionReply.ejs"),
        data
      );
      try {
        await sendMail({
          email: questionExist.user.email,
          subject: "New reply on your question",
          template: "questionReply.ejs",
          data,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 400));
      }
    }
    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// add review in course
export const addReview = catchError(async (req, res, next) => {
  try {
    const userCourseList = req.user.courses;
    const courseId = req.params.id;
    const courseExist = userCourseList?.find(
      (c) => c._id.toString() === courseId
    );
    if (!courseExist) {
      return next(
        new ErrorHandler("You are not eligible to access this course", 400)
      );
    }
    const course = await courseModel.findById(courseId);
    const { review, rating } = req.body;
    const reviewData = {
      user: req.user,
      comment: review,
      rating,
    };
    course?.reviews.push(reviewData);
    let avg = 0;
    course?.reviews?.forEach((r) => {
      avg += r.rating;
    });
    if (course) {
      course.ratings = avg / course?.reviews?.length;
    }
    await course.save();
    const notification = {
      title: "New Review Received",
      message: `${req.user.name} has reviewed your course ${course.name}`,
    };
    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const addReplyToReview = catchError(async (req, res, next) => {
  try {
    const { comment, courseId, reviewId } = req.body;
    const course = await courseModel.findById(courseId);

    if (!course) {
      return next(new ErrorHandler("Course not found", 404));
    }
    const review = course.reviews.find((r) => r._id.toString() === reviewId);
    if (!review) {
      return next(new ErrorHandler("Review not found", 404));
    }
    const replyData = {
      user: req.user,
      comment,
    };
    if (!review.commentReplies) {
      review.commentReplies = [];
    }
    review.commentReplies?.push(replyData);
    await course.save();
    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const getAllCoursesForAdmin = catchError(async (req, res, next) => {
  try {
    getAllCoursesService(res);
  } catch (error) {
    return next(new ErrorHandler(error.message, 400)); // Catch any errors
  }
});

export const deleteCourse = catchError(async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await courseModel.findById(id);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Use a filter object with `deleteOne`
    await courseModel.deleteOne({ _id: id });

    // Delete the course ID from Redis

    res
      .status(200)
      .json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});
