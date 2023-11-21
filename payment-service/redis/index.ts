import redis from "npm:redis";

export const client = redis.createClient({
  socket: {
    host: Deno.env.get("REDIS_HOST"),
    port: Deno.env.get("REDIS_PORT"),
  },
});