import { Redis } from "ioredis";
import { redisHost, redisPassword } from "./env";

export const redisClient = new Redis({
  host: redisHost,
  password: redisPassword,
});
