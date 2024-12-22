import express from "express";

import { authorizeRoles, isAuthenticated } from "../utils/auth.js";
import {
  getNotifications,
  updateNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get(
  "/getAllNotifications",
  isAuthenticated,
  authorizeRoles("admin"),
  getNotifications
);

router.put(
  "/updateNotification/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  updateNotifications
);

export default router;
