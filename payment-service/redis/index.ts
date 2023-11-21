import redis from "npm:redis";

export const redisClient = redis.createClient({
  socket: {
    host: "redis.docker-compose",
    port: "6379",
  },
});
