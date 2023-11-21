import { redisClient } from "./redis/index.ts";
import { expressApp } from "./express/index.ts";
import { processInvoice } from "./helpers/process-invoice.ts";

const connectAndSubscribeToPubsub = async () => {
  const subscriber = redisClient.duplicate();

  await subscriber.connect();

  await subscriber.subscribe("payment", processInvoice);
};

(async () => {
  await connectAndSubscribeToPubsub();

  expressApp.listen(3002, () => {
    console.log(">> Payment service is up and running!");
  });
})();
