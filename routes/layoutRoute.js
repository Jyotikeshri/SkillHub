import express from "express";
import { authorizeRoles, isAuthenticated } from "../utils/auth.js";
import {
  createLayout,
  editLayout,
  getLayoutByType,
} from "../controllers/layoutController.js";
import { updateAccessToken } from "../controllers/userController.js";

const router = express.Router();

router.post(
  "/createlayout",
  updateAccessToken,
  isAuthenticated,
  authorizeRoles("admin"),
  createLayout
);

router.put(
  "/editlayout",
  updateAccessToken,
  isAuthenticated,
  authorizeRoles("admin"),
  editLayout
);
router.get(
  `/getlayout/:type`,
  updateAccessToken,
  isAuthenticated,

  getLayoutByType
);

export default router;
