import dotenv from "dotenv";

dotenv.config();
// Assuming you have a redis module for your project

// Parse environment variables to integrate with fallback values
const accessTokenExpire = parseInt(
  process.env.ACCESS_TOKEN_EXPIRE || "300",
  10
);
const refreshTokenExpire = parseInt(
  process.env.REFRESH_TOKEN_EXPIRE || "1200",
  10
);

// Option for cookies
export const accessTokenOptions = {
  expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
  maxAge: accessTokenExpire * 60 * 60 * 1000,
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
};

export const refreshTokenOptions = {
  expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
  maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
  secure: process.env.NODE_ENV === "production",

  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
};

export const sendToken = (user, statusCode, res) => {
  const accessToken = user.signAccessToken();
  const refreshToken = user.signRefreshToken();

  // Upload session to redis

  console.log("accessToken", accessToken);
  console.log("refreshToken", refreshToken);

  // Only set secure to true in production
  if (process.env.NODE_ENV === "production") {
    accessTokenOptions.secure = true;
    refreshTokenOptions.secure = true; // Ensure the refresh token is also secure
  }

  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);

  console.log("Set-Cookie Headers:", res.getHeaders()["set-cookie"]);

  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
  });
};
