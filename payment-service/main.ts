import { redisClient } from "./redis/index.ts";
import { expressApp } from "./express/index.ts";
import { tryToProcessInvoice } from "./helpers/process-invoice.ts";
import { tryToProcessRefund } from "./helpers/process-refund.ts";

const main = () => {
  connectAndSubscribeToPayment();
  connectAndSubscribeToRefund();
  startExpressServer();
};

const connectAndSubscribeToPayment = async () => {
  const subscriber = redisClient.duplicate();
  await subscriber.connect();
  await subscriber.subscribe("payment", tryToProcessInvoice);
};

const connectAndSubscribeToRefund = async () => {
  const subscriber = redisClient.duplicate();
  await subscriber.connect();
  await subscriber.subscribe("refund", tryToProcessRefund);
};

const startExpressServer = () => {
  expressApp.listen(3002, () => {
    console.log(">> Payment service is up and running!");
  });
};

main();
