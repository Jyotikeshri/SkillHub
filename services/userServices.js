import User from "../models/userModel.js";
import { redis } from "../utils/redis.js";

export const getUserById = async (id, res) => {
  try {
    const userJson = await redis.get(id);

    if (userJson !== null) {
      const user = JSON.parse(userJson); // Parse JSON safely
      res.status(200).json({
        success: true,
        user, // Send as a JSON object
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// get all users
export const getAllUsersService = async (res) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
};

export const updateUserRole = async (res, id, role) => {
  const user = await User.findByIdAndUpdate(id, { role }, { new: true });
  res.status(200).json({
    success: true,
    user,
  });
};
