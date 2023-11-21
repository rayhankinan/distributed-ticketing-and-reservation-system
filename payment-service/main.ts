import { redisClient } from "./redis/index.ts";
import { expressApp } from "./express/index.ts";
import { processInvoice } from "./helpers/process-invoice.ts";

const main = () => {
  try {
    connectAndSubscribeToPubsub();
    runExpressApp();
  } catch (error) {
    console.log(">> Payment server failed to start", error);
  }
};

const connectAndSubscribeToPubsub = async () => {
  const subscriber = redisClient.duplicate();
  await subscriber.connect();
  await subscriber.subscribe(
    Deno.env.get("REDIS_CHANNEL") || "payment",
    async (invoiceId) => {
      await processInvoice(invoiceId);
    }
  );
};

const runExpressApp = () => {
  expressApp.listen(3002, () => {
    console.log(">> Payment service is up and running!");
  });
};

main();
