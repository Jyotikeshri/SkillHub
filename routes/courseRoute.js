import express from "express";
import { authorizeRoles, isAuthenticated } from "../utils/auth.js";
import {
  addAnswer,
  addReplyToReview,
  addReview,
  createQuestion,
  deleteCourse,
  editCourse,
  getAllCourses,
  getAllCoursesForAdmin,
  getCourseForValidUser,
  getSingleCourse,
  uploadCourse,
} from "../controllers/courseController.js";
import { updateAccessToken } from "../controllers/userController.js";
const router = express.Router();

router.post(
  "/createCourse",
  updateAccessToken,
  isAuthenticated,
  authorizeRoles("admin"),
  uploadCourse
);

router.put(
  "/editCourse/:id",
  updateAccessToken,
  isAuthenticated,
  authorizeRoles("admin"),
  editCourse
);

router.get(
  "/getCourse/:id",

  getSingleCourse
);
router.get(
  "/getCourses",

  getAllCourses
);

router.get(
  "/getCourseContent/:id",
  updateAccessToken,
  isAuthenticated,

  getCourseForValidUser
);
router.put(
  "/addQuestion",
  updateAccessToken,
  isAuthenticated,

  createQuestion
);

router.put(
  "/addAnswer",
  updateAccessToken,
  isAuthenticated,

  addAnswer
);

router.put(
  "/addReview/:id",
  updateAccessToken,
  isAuthenticated,

  addReview
);

router.put(
  "/addReviewReply",
  updateAccessToken,
  isAuthenticated,
  authorizeRoles("admin"),

  addReplyToReview
);

router.get(
  "/getAllCoursesForAdmin",
  updateAccessToken,
  isAuthenticated,
  authorizeRoles("admin"),

  getAllCoursesForAdmin
);

router.delete(
  "/deleteCourse/:id",
  updateAccessToken,
  isAuthenticated,
  authorizeRoles("admin"),

  deleteCourse
);

// import { streamVideo } from "../controllers/courseController.js"; // Import the new function
// // Add the stream video route
// router.get("/stream-video/:courseId/:contentId", isAuthenticated, streamVideo);

export default router;
