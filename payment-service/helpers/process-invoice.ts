import { mongoClient } from "../mongo/index.ts";
import { publishMessage } from "../redis/publish.ts";

export const processInvoice = async (invoiceId: string) => {
  try {
    const db = mongoClient.db("payment");
    const collection = db.collection("invoices");

    const isFailed = Math.random() < 0.1;
    const targetStatus = isFailed ? "FAILED" : "SUCCESS";

    await collection.updateOne(
      { id: invoiceId },
      { $set: { status: targetStatus } }
    );

    // TODO: Call webhook API

    if (!isFailed) {
      console.log(`>> Successfully processed invoice ID ${invoiceId}`);
    } else {
      console.log(`>> Failed processing invoice ID ${invoiceId}`);
    }
  } catch {
    const throwBackIntoQueue = async () => {
      await publishMessage(invoiceId);
    };

    await throwBackIntoQueue();
  }
};
