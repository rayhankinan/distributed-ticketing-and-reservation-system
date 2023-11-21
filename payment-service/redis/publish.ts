import { redisClient } from "./index.ts";

export const publishMessage = async (message: string) => {
  const publisher = redisClient.duplicate();

  await publisher.connect();
  await publisher.publish(Deno.env.get("REDIS_CHANNEL") || "payment", message);
};
