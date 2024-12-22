import express from "express";
import { authorizeRoles, isAuthenticated } from "../utils/auth.js";
import {
  getCourseAnalytics,
  getOrderAnalytics,
  getUserAnalytics,
} from "../controllers/analyticsController.js";

const router = express.Router();
router.get(
  "/getUserAnalytics",
  isAuthenticated,
  authorizeRoles("admin"),
  getUserAnalytics
);

router.get(
  "/getCourseAnalytics",
  isAuthenticated,
  authorizeRoles("admin"),
  getCourseAnalytics
);

router.get(
  "/getOrderAnalytics",
  isAuthenticated,
  authorizeRoles("admin"),
  getOrderAnalytics
);
export default router;
