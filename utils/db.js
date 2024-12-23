import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const dbUrl = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl).then((data) => {
      console.log(`connected to ${data.connection.host}`);
    });
  } catch (error) {
    console.error(error.message);
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
