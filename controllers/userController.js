import User from "../models/userModel.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { catchError } from "../middleware/catchAsyncError.js";
import jwt from "jsonwebtoken";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
dotenv.config();
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail.js";
import { fileURLToPath } from "url";
import {
  sendToken,
  refreshTokenOptions,
  accessTokenOptions,
} from "../utils/jwt.js";

import { redis } from "../utils/redis.js";
import {
  getAllUsersService,
  getUserById,
  updateUserRole,
} from "../services/userServices.js";
import { request } from "http";

export const registerUser = catchError(async (req, res, next) => {
  try {
    const { name, email, password, avatar } = req.body;

    const isExist = await User.findOne({ email });
    if (isExist) {
      return next(new ErrorHandler("Email already exists", 400));
    }
    const user = {
      name,
      email,
      password,
    };
    const activationToken = createToken(user);
    const activationCode = activationToken.activationCode;
    const data = {
      user: user.name,
      activationCode: activationCode, // `activationCode` is a variable
    };
    const __filename = fileURLToPath(import.meta.url); // Current file path
    const __dirname = path.dirname(__filename);
    const html = ejs.renderFile(
      path.join(__dirname, "../mails/activationMail.ejs"),
      data
    );
    try {
      await sendMail({
        email: user.email,
        subject: "Activate Your Account",
        template: "activationMail.ejs",
        data,
      });
      res.status(201).json({
        success: true,
        message: `Please Check your email ${user.email} to activate your account!`,
        activationToken: activationToken.token,
      });
    } catch (error) {
      return next(new ErrorHandler("Error sending email", 400));
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const createToken = (user) => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign({ user, activationCode }, process.env.JWT_SECRET, {
    expiresIn: "5m",
  });
  return { token, activationCode };
};

export const activateUser = catchError(async (req, res, next) => {
  try {
    const { activation_code, activation_token } = req.body;

    // Verify JWT and get payload
    const newUser = jwt.verify(activation_token, process.env.JWT_SECRET);

    // Compare activation codes
    if (newUser.activationCode !== activation_code) {
      return next(new ErrorHandler("Invalid activation code", 400));
    }

    // Extract user data
    const { name, email, password } = newUser.user;

    // Check if the user already exists
    const userExist = await User.findOne({ email });
    if (userExist) {
      return next(new ErrorHandler("Email Already Exist", 400));
    }

    // Create the new user
    const user = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      message: "User activated successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const loginUser = catchError(async (req, res, next) => {
  try {
    const { password, email } = req.body;

    // Validate input fields
    if (!email || !password) {
      return next(
        new ErrorHandler("Please provide both email and password", 400)
      );
    }

    // Check if the user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorHandler("Invalid email or password", 400));
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new ErrorHandler("Invalid email or password", 400));
    }

    // Generate and send token
    await sendToken(user, 200, res);
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});
export const logoutUser = catchError(async (req, res, next) => {
  try {
    // Clear access and refresh tokens from cookies by setting their expiry to a past date
    res.cookie("access_token", "", {
      maxAge: 0, // Expiry in the past
      httpOnly: true,
      sameSite: "lax",
      // Use secure cookies in production
    });

    res.cookie("refresh_token", "", {
      maxAge: 0, // Expiry in the past
      httpOnly: true,
      sameSite: "lax",
      // Use secure cookies in production
    });

    // Delete the user data from Redis using the user id from the request object

    // Send the response to the client
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400)); // Catch any errors
  }
});

//update access token

export const updateAccessToken = async (req, res, next) => {
  try {
    const refresh_token = req.cookies.refresh_token;

    if (!refresh_token) {
      return next(new ErrorHandler("No refresh token found", 400));
    }

    const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN);
    if (!decoded) {
      return next(new ErrorHandler("Could not refresh token", 400));
    }

    // Retrieve user from database instead of Redis
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ErrorHandler("User not found", 400));
    }

    const access_token = jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "5m" }
    );
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN, {
      expiresIn: "7d",
    });

    res.cookie("access_token", access_token, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);

    next();
  } catch (error) {
    console.error("Error in updateAccessToken:", error);
    return next(new ErrorHandler(error.message, 500));
  }
};

// get user info

export const getUserInfo = async (req, res, next) => {
  try {
    const userId = req.user?._id;

    // Fetch user directly from database
    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorHandler("User not found", 400));
    }

    res.status(200).json({
      success: true,
      user, // Send the user info from the database
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400)); // Catch any errors
  }
};

// social auth

export const socialAuth = catchError(async (req, res, next) => {
  try {
    const { email, name, avatar } = req.body;

    const avatarUrl = {
      url: avatar,
    };
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, name, avatar: avatarUrl });
      sendToken(user, 200, res);
    } else {
      sendToken(user, 200, res);
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400)); // Catch any errors
  }
});

//update user info

export const updateUserInfo = catchError(async (req, res, next) => {
  try {
    const { email, name } = req.body;
    const userId = req.user?._id;
    const user = await User.findById(userId);
    if (email && user) {
      user.email = email;
    }
    if (name && user) {
      user.name = name;
    }

    await user.save(); // Save directly to the database

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400)); // Catch any errors
  }
});

export const updateUserPass = catchError(async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return next(
        new ErrorHandler("Please provide both old and new password", 400)
      );
    }

    const user = await User.findById(req.user?._id).select("+password");
    if (user?.password == undefined) {
      return next(new ErrorHandler("Password is not set", 400));
    }
    const isValidPassword = await user?.comparePassword(
      oldPassword,
      user.password
    );
    if (!isValidPassword) {
      return next(new ErrorHandler("Invalid old password", 400));
    }
    user.password = newPassword;
    await user.save(); // Save directly to the database

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400)); // Catch any errors
  }
});

export const updateprofilePicture = catchError(async (req, res, next) => {
  try {
    const { avatar } = req.body;

    const userId = req.user._id;

    const user = await User.findById(userId);

    if (avatar && user) {
      if (user?.avatar?.public_id) {
        await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);
      }
      const myCloud = await cloudinary.v2.uploader.upload(avatar, {
        folder: "avatars",
        width: 150,
      });
      user.avatar = {
        public_id: myCloud?.public_id,
        url: myCloud?.secure_url,
      };
      await user.save();
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400)); // Catch any errors
  }
});

// get all users -- admin

export const getAllUsers = catchError(async (req, res, next) => {
  try {
    getAllUsersService(res);
  } catch (error) {
    return next(new ErrorHandler(error.message, 400)); // Catch any errors
  }
});

// update user role --admin
export const updateRole = catchError(async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      updateUserRole(res, user._id, role);
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400)); // Catch any errors
  }
});

// delete user -- admin
export const deleteUser = catchError(async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    await User.deleteOne(user); // Delete directly from the database
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400)); // Catch any errors
  }
});
