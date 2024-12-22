import dotenv from "dotenv";
dotenv.config();

const accessTokenExpire = parseInt(
  process.env.ACCESS_TOKEN_EXPIRE || "300",
  10
);
const refreshTokenExpire = parseInt(
  process.env.REFRESH_TOKEN_EXPIRE || "1200",
  10
);

//option for cookies
export const accessTokenOptions = {
  expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
  maxAge: accessTokenExpire * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};
export const refreshTokenOptions = {
  expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
  maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

// export const accessTokenOptions = {
//   expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000), // 10 minutes in milliseconds
//   maxAge: accessTokenExpire * 60 * 60 * 1000, // Same as above
//   httpOnly: true,
//   secure: process.env.NODE_ENV === "production", // Secure in production
//   sameSite: "lax",
// };

// export const refreshTokenOptions = {
//   expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000), // 40 minutes in milliseconds
//   maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000, // Same as above
//   httpOnly: true,
//   secure: process.env.NODE_ENV === "production", // Secure in production
//   sameSite: "lax",
// };

export const sendToken = async (user, statusCode, res) => {
  const accessToken = user.SignAccessToken();
  const refreshToken = user.SignRefreshToken();

  // upload session to redis
  console.log("accessToken: " + accessToken);
  console.log("refreshToken: " + refreshToken);

  // only set secure to true in production
  if (process.env.NODE_ENV === "production") {
    accessTokenOptions.secure = true;
  }

  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);
  console.log("cookies: " + res.cookie.access_token);
  console.log("cookies: " + res.cookie.refresh_token);

  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
  });
};
