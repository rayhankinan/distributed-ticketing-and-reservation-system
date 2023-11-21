import { ObjectId } from "npm:mongodb";

import { mongoClient } from "../mongo/index.ts";
import { PaymentStatus } from "../enum/index.ts";
import { publishMessage } from "../redis/publish.ts";

const processInvoiceSuccess = async (invoiceId: string) => {
  const isFailed = Math.random() < 0; // TODO: Replace with 0.1 if system is stable
  const targetStatus = isFailed
    ? PaymentStatus.REFUNDED
    : PaymentStatus.SUCCESS;

  const db = mongoClient.db("payment");
  await db
    .collection("invoices")
    .updateOne(
      { _id: new ObjectId(invoiceId) },
      { $set: { status: targetStatus } }
    );

  if (!isFailed) {
    console.log(`>> Successfully processed invoice ID ${invoiceId}`);
    // TODO: Call webhook API (success)
  } else {
    console.log(`>> Failed processing invoice ID ${invoiceId}`);
    // TODO: Call webhook API (failed)
  }
};

export const processInvoice = async (invoiceId: string) =>
  await processInvoiceSuccess(invoiceId).catch(async () => {
    console.log(`>> Failed processing invoice ID ${invoiceId}`);

    // Put back to queue
    await publishMessage(invoiceId);
  });
