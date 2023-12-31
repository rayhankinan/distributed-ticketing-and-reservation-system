import { Document, ObjectId, WithId } from "npm:mongodb";
import axios from "npm:axios";
import * as jose from "npm:jose";

import { mongoClient } from "../mongo/index.ts";
import { PaymentStatus, WebhookRoutes } from "../enum/index.ts";
import { invoiceSchema } from "../schema/process-invoice.ts";

export const tryToProcessRefund = async (invoiceId: string) => {
  try {
    await processRefund(invoiceId);
  } catch (error) {
    console.log(`>> Failed processing refund ID ${invoiceId}: ${error}`);
  }
};

const processRefund = async (invoiceId: string) => {
  const isFailed = Math.random() < 0; // Refund is a stable process, it doesn't fail

  const targetStatus = isFailed ? PaymentStatus.FAILED : PaymentStatus.REFUNDED;

  const result = await updateInvoiceDocumentAndReturn(invoiceId, targetStatus);
  const parsedInvoice = parseUpdatedInvoice(result);

  const bearer = await createSignedUserJwt(parsedInvoice.data.userId);

  const axiosInstance = axios.create({
    baseURL: "http://api.ticket-service.docker-compose:3000",
    headers: {
      Authorization: `Bearer ${bearer}`,
    },
  });

  if (!isFailed) {
    console.log(`>> Successfully processed refund ID ${invoiceId}`);
    await axiosInstance.post(WebhookRoutes.WEBHOOK_REFUND, {
      id: parsedInvoice.data.seatId,
    });
  } else {
    console.log(
      `>> Failed processing refund ID ${invoiceId}: deliberate error`
    );
    await axiosInstance.post(WebhookRoutes.WEBHOOK_FAILED, {
      id: parsedInvoice.data.seatId,
    });
  }
};

const updateInvoiceDocumentAndReturn = async (
  invoiceId: string,
  targetStatus: PaymentStatus.FAILED | PaymentStatus.REFUNDED
) => {
  const db = mongoClient.db("payment");
  const result = await db
    .collection("invoices")
    .findOneAndUpdate(
      { _id: new ObjectId(invoiceId) },
      { $set: { status: targetStatus } }
    );

  if (!result) throw new Error("Refund not found");

  return result;
};

const parseUpdatedInvoice = (invoice: WithId<Document>) => {
  const parsedInvoice = invoiceSchema.safeParse(invoice);
  if (!parsedInvoice.success) throw new Error("Invalid refund");

  return parsedInvoice;
};

const createSignedUserJwt = async (userId: string) => {
  const token = await new jose.SignJWT({
    userId: userId,
    role: "USER",
  })
    .setProtectedHeader({ alg: "HS256" })
    .sign(new TextEncoder().encode("dhika-jelek"));

  return token;
};
