import express from "express";
import {
  createOrder,
  getAllOrdersForAdmin,
} from "../controllers/orderController.js";
import { authorizeRoles, isAuthenticated } from "../utils/auth.js";

const router = express.Router();

router.post("/createOrder", isAuthenticated, createOrder);
router.get(
  "/getAllOrders",
  isAuthenticated,
  authorizeRoles("admin"),

  getAllOrdersForAdmin
);

export default router;
