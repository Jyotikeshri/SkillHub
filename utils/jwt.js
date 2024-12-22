import dotenv from "dotenv";
dotenv.config();

const accessTokenExpire = parseInt(
  process.env.ACCESS_TOKEN_EXPIRE || "300", // 5 minutes
  10
);
const refreshTokenExpire = parseInt(
  process.env.REFRESH_TOKEN_EXPIRE || "1200", // 20 minutes
  10
);

// Option for cookies
export const accessTokenOptions = {
  expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
  maxAge: accessTokenExpire * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Allow cross-origin cookies in production
  secure: process.env.NODE_ENV === "production", // Secure cookies only in production
  // Replace with your actual domain in production
};

export const refreshTokenOptions = {
  expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
  maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Allow cross-origin cookies in production
  secure: process.env.NODE_ENV === "production", // Secure cookies only in production
  // Replace with your actual domain in production
};

export const sendToken = async (user, statusCode, res) => {
  const accessToken = user.signAccessToken();
  const refreshToken = user.signRefreshToken();
  console.log("NODE_ENV:", process.env.NODE_ENV); // Should log "production" in production environment

  // Log the tokens for debugging (don't log them in production)
  if (process.env.NODE_ENV !== "production") {
    console.log("accessToken: " + accessToken);
    console.log("refreshToken: " + refreshToken);
  }

  // Set cookies in the response
  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);

  // Log cookie values (Note: This won't log the actual cookie values, but you can inspect them in the browser dev tools)

  console.log("Cookies set: ", {
    access_token: res.cookies.access_token,
    refresh_token: res.cookies.refresh_token,
  });

  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
  });
};
