import { createClient } from "npm:redis";

export const redisClient = createClient({
  url: "redis://payment-redis.docker-compose:6379",
});
