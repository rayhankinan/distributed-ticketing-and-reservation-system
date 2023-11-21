import { ObjectId } from "npm:mongodb";
import { z } from "npm:zod";
import axios from "npm:axios";
import * as jose from "npm:jose";

import { mongoClient } from "../mongo/index.ts";
import { PaymentStatus } from "../enum/index.ts";
import { publishMessage } from "../redis/publish.ts";

const schema = z.object({
  userId: z.string().uuid(),
  seatId: z.string().uuid(),
});

const processInvoiceSuccess = async (invoiceId: string) => {
  const isFailed = Math.random() < 0; // TODO: Replace with 0.1 if system is stable
  const targetStatus = isFailed
    ? PaymentStatus.REFUNDED
    : PaymentStatus.SUCCESS;

  const db = mongoClient.db("payment");
  const result = await db
    .collection("invoices")
    .findOneAndUpdate(
      { _id: new ObjectId(invoiceId) },
      { $set: { status: targetStatus } }
    );

  if (!result) throw new Error("Invoice not found");

  const parsed = schema.safeParse(result);

  if (!parsed.success) throw new Error("Invalid invoice");

  const bearer = await new jose.SignJWT({
    userId: parsed.data.userId,
    role: "USER",
  })
    .setProtectedHeader({ alg: "HS256" })
    .sign(new TextEncoder().encode("dhika-jelek"));

  const axiosInstance = axios.create({
    baseURL: "http://api.ticket-service.docker-compose:3000",
    headers: {
      Authorization: `Bearer ${bearer}`,
    },
  });

  if (!isFailed) {
    console.log(`>> Successfully processed invoice ID ${invoiceId}`);

    // Call webhook API (success)
    await axiosInstance.post("/seat/webhook-success", {
      id: parsed.data.seatId,
    });
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
