import express from "express";
import {
  activateUser,
  deleteUser,
  getAllUsers,
  getUserInfo,
  loginUser,
  logoutUser,
  registerUser,
  socialAuth,
  updateAccessToken,
  updateprofilePicture,
  updateRole,
  updateUserInfo,
  updateUserPass,
} from "../controllers/userController.js";
import { authorizeRoles, isAuthenticated } from "../utils/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/activateUser", activateUser);
router.post("/loginUser", loginUser);
router.get("/logoutUser", updateAccessToken, isAuthenticated, logoutUser);
router.get("/refreshToken", updateAccessToken);
router.get("/me", updateAccessToken, isAuthenticated, getUserInfo);
router.post("/socialAuth", socialAuth);
router.put(
  "/updateUserInfo",
  updateAccessToken,
  isAuthenticated,
  updateUserInfo
);
router.put(
  "/updateUserPass",
  updateAccessToken,
  isAuthenticated,
  updateUserPass
);
router.put(
  "/updateUserAvatar",
  updateAccessToken,
  isAuthenticated,
  updateprofilePicture
);
router.get(
  "/getAllUsers",
  updateAccessToken,
  isAuthenticated,
  authorizeRoles("admin"),

  getAllUsers
);

router.put(
  "/updateUserRole",
  updateAccessToken,
  isAuthenticated,
  authorizeRoles("admin"),

  updateRole
);

router.delete(
  "/deleteUser/:id",
  updateAccessToken,
  isAuthenticated,
  authorizeRoles("admin"),

  deleteUser
);
export default router;
