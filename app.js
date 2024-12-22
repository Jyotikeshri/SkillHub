import express from "express";

export const app = express();

import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { ErrorMiddleware } from "./middleware/error.js";
import userRouter from "./routes/userRoute.js";
import courseRouter from "./routes/courseRoute.js";
import orderRouter from "./routes/orderRoute.js";
import analyticsRouter from "./routes/analyticRoute.js";

import notificationRouter from "./routes/notificationRoute.js";
import layoutRouter from "./routes/layoutRoute.js";
import { rateLimit } from "express-rate-limit";

dotenv.config();

// body parser
app.use(express.json({ limit: "50mb" }));

// cookies parser
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:3000", // For local development
  "https://skillhub-five.vercel.app",
  //  // Replace with your actual frontend domain
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // Allow credentials
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

app.use("/api/v1", userRouter);
app.use("/api/v1", courseRouter);
app.use("/api/v1", orderRouter);
app.use("/api/v1", notificationRouter);
app.use("/api/v1", analyticsRouter);
app.use("/api/v1", layoutRouter);

app.get("/test", (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "Test route is working fine",
  });
});

app.all("*", (req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`);
  res.status(404);
  next(err);
});

app.use(limiter);

app.use(ErrorMiddleware);
