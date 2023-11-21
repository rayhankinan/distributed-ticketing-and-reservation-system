import { mongoClient } from "../mongo/index.ts";
import { publishMessage } from "../redis/publish.ts";

export const processInvoice = async (invoiceId: string) => {
  try {
    const db = mongoClient.db("payment");
    const collection = db.collection("invoices");

    const isFailed = Math.random() < 0; // TODO: Replace with 0.1 if system is stable
    const targetStatus = isFailed ? "FAILED" : "SUCCESS";

    await collection.updateOne(
      { id: invoiceId },
      { $set: { status: targetStatus } }
    );

    if (!isFailed) {
      console.log(`>> Successfully processed invoice ID ${invoiceId}`);
      // TODO: Call webhook API (success)
    } else {
      console.log(`>> Failed processing invoice ID ${invoiceId}`);
      // TODO: Call webhook API (failed)
    }
  } catch {
    // Throw back to queue
    await publishMessage(invoiceId);
  }
};
