import express from "npm:express";
import { Request, Response } from "npm:@types/express";
import { client } from "./redis/index.ts";

const app = new express();

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello World!");
});

const main = () => {
  connectAndSubscribeToPubsub();
  app.listen(3002, () => {
    console.log(">> Payment service is up and running!");
  });
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
