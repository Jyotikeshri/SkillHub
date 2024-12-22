import { app } from "./app.js";
import dotenv from "dotenv";
import http from "http";
import connectDB from "./utils/db.js";
import { v2 as cloudinary } from "cloudinary";
import { initSocketServer } from "./socketServer.js";

dotenv.config();
const server = http.createServer(app);

const port = process.env.PORT || 8080;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
//   connectDB();
// });

initSocketServer(server);

server.listen(process.env.PORT, () => {
  console.log(`Server is connected with port ${process.env.PORT}`);
  connectDB();
});
