import { mongoClient } from "../mongo/index.ts";
import { publishMessage } from "../redis/publish.ts";

export const processInvoice = async (invoiceId: string) => {
  try {
    const db = mongoClient.db("payment");
    const collection = db.collection("invoices");

    await collection.updateOne(
      { id: invoiceId },
      { $set: { status: "SUCCESS" } }
    );

    // TODO: Call webhook API

    console.log(`>> Successfully processed invoice ID ${invoiceId}`);
  } catch {
    const throwBackIntoQueue = async () => {
      await publishMessage(invoiceId);
    };

    await throwBackIntoQueue();
  }
};
