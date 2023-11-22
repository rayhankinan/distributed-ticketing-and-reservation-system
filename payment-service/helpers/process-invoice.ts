import { Document, ObjectId, WithId } from "npm:mongodb";
import axios from "npm:axios";
import * as jose from "npm:jose";

import { mongoClient } from "../mongo/index.ts";
import { PaymentStatus, WebhookRoutes } from "../enum/index.ts";
import { publishMessage } from "../redis/publish.ts";
import { invoiceSchema } from "../schema/process-invoice.ts";

export const tryToProcessInvoice = async (invoiceId: string) => {
  try {
    await processInvoice(invoiceId);
  } catch (error) {
    console.log(`>> Failed processing invoice ID ${invoiceId}: ${error}`);

    // Put back to queue
    await publishMessage("payment", invoiceId);
  }
};

const processInvoice = async (invoiceId: string) => {
  const isFailed = Math.random() < 0; // NOTE: Replace with 0.1 if system is stable

  const targetStatus = isFailed ? PaymentStatus.FAILED : PaymentStatus.SUCCESS;

  const result = await updateInvoiceDocumentAndReturn(invoiceId, targetStatus);
  const parsedInvoice = parseUpdatedInvoice(result);

  const bearer = await createSignedUserJwt(parsedInvoice.data.seatId);

  const axiosInstance = axios.create({
    baseURL: "http://api.ticket-service.docker-compose:3000",
    headers: {
      Authorization: `Bearer ${bearer}`,
    },
  });

  if (!isFailed) {
    console.log(`>> Successfully processed invoice ID ${invoiceId}`);
    await axiosInstance.post(WebhookRoutes.WEBHOOK_SUCCESS, {
      id: parsedInvoice.data.seatId,
    });
  } else {
    console.log(
      `>> Failed processing invoice ID ${invoiceId}: deliberate error`
    );
    await axiosInstance.post(WebhookRoutes.WEBHOOK_FAILED, {
      id: parsedInvoice.data.seatId,
    });
  }
};

const updateInvoiceDocumentAndReturn = async (
  invoiceId: string,
  targetStatus: PaymentStatus.FAILED | PaymentStatus.SUCCESS
) => {
  const db = mongoClient.db("payment");
  const result = await db
    .collection("invoices")
    .findOneAndUpdate(
      { _id: new ObjectId(invoiceId) },
      { $set: { status: targetStatus } }
    );

  if (!result) throw new Error("Invoice not found");

  return result;
};

const parseUpdatedInvoice = (invoice: WithId<Document>) => {
  const parsedInvoice = invoiceSchema.safeParse(invoice);
  if (!parsedInvoice.success) throw new Error("Invalid invoice");

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
