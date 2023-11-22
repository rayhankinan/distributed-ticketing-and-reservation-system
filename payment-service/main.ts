import { redisClient } from "./redis/index.ts";
import { expressApp } from "./express/index.ts";
import { tryToProcessInvoice } from "./helpers/process-invoice.ts";

const main = () => {
  connectAndSubscribeToPubsub();
  startExpressServer();
};

const connectAndSubscribeToPubsub = async () => {
  const subscriber = redisClient.duplicate();
  await subscriber.connect();
  await subscriber.subscribe("payment", tryToProcessInvoice);
};

const startExpressServer = () => {
  expressApp.listen(3002, () => {
    console.log(">> Payment service is up and running!");
  });
};

main();
