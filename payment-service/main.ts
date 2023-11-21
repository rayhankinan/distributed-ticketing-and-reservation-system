import redis from "npm:redis";

(async () => {
  const client = redis.createClient({
    socket: {
      host: Deno.env.get("REDIS_HOST"),
      port: Deno.env.get("REDIS_PORT"),
    },
  });

  const subscriber = client.duplicate();

  await subscriber.connect();

  await subscriber.subscribe(
    Deno.env.get("REDIS_CHANNEL") || "payment",
    (message) => {
      console.log(message); // 'message'
    }
  );
})();
