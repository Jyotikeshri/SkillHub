import dotenv from "dotenv";
dotenv.config();

export const accessTokenExpire = parseInt(
  process.env.ACCESS_TOKEN_EXPIRE || "300",
  10
);
export const refreshTokenExpire = parseInt(
  process.env.REFRESH_TOKEN_EXPIRE || "1200",
  10
);

export const accessTokenOptions = {
  expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000), // 10 minutes in milliseconds
  maxAge: accessTokenExpire * 60 * 60 * 1000, // Same as above
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // Secure in production
  sameSite: "lax",
};

export const refreshTokenOptions = {
  expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000), // 40 minutes in milliseconds
  maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000, // Same as above
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // Secure in production
  sameSite: "lax",
};

export const sendToken = async (user, statusCode, res) => {
  const accessToken = await user.signAccessToken();
  const refreshToken = await user.signRefreshToken();

  // No Redis operation here, all the data is stored and fetched directly from the database

  // Ensure the cookies are secure in production
  if (process.env.NODE_ENV === "production") {
    accessTokenOptions.secure = true;
  }

  // Set the cookies with the access and refresh tokens
  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);

  // Send the response
  res.status(statusCode).json({
    success: true,
    user,
    accessToken: accessToken,
  });
};
