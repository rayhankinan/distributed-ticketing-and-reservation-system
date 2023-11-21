import { client } from "./redis/index.ts";

const main = async () => {
  await connectAndSubscribeToPubsub();
};

const connectAndSubscribeToPubsub = async () => {
  const subscriber = client.duplicate();
  await subscriber.connect();
  await subscriber.subscribe(
    Deno.env.get("REDIS_CHANNEL") || "payment",
    (message) => {
      console.log(message); // 'message'
    }
  );
};

main();
