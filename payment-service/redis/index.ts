import redis from "npm:redis";

export const redisClient = redis.createClient({
  socket: {
    host: Deno.env.get("REDIS_HOST"),
    port: Deno.env.get("REDIS_PORT"),
  },
});