import dotenv from "dotenv";
import { Redis } from "ioredis";
dotenv.config();

const redisClient = () => {
  if (process.env.REDIS_URL) {
    console.log("redis connected successfully");
    return process.env.REDIS_URL;
  }
};

export const redis = new Redis(redisClient());
