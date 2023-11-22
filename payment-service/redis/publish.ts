import { redisClient } from "./index.ts";

export const publishMessage = async (channel: string, message: string) => {
  const publisher = redisClient.duplicate();

  await publisher.connect();
  await publisher.publish(channel, message);
};
