// @deno-types="npm:@types/express"
import { type Response } from "npm:express";
import { type Request } from "npm:express-jwt";
import { ReasonPhrases, StatusCodes } from "npm:http-status-codes";

import { mongoClient } from "../mongo/index.ts";
import { publishMessage } from "../redis/publish.ts";
import { PaymentStatus } from "../enum/index.ts";
import { createInvoiceRequestSchema } from "../schema/index.ts";

export const createInvoiceHandler = async (
  req: Request<{
    userId: string;
  }>,
  res: Response
) => {
  try {
    await createInvoice(req, res);
  } catch (error) {
    console.log(`>> Failed creating invoice: ${error}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      data: null,
      metadata: null,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

const createInvoice = async (
  req: Request<{
    userId: string;
  }>,
  res: Response
) => {
  if (!req.auth) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      data: null,
      metadata: null,
      message: ReasonPhrases.UNAUTHORIZED,
    });
    return;
  }

  const parsedRequest = createInvoiceRequestSchema.safeParse(req.body);
  if (!parsedRequest.success) {
    res.status(StatusCodes.BAD_REQUEST).json({
      data: null,
      metadata: null,
      message: ReasonPhrases.BAD_REQUEST,
    });
    return;
  }

  const data = await insertToInvoiceAndSendMessage(
    parsedRequest.data.seatId,
    req.auth.userId
  );

  res.status(StatusCodes.OK).json({
    data,
    metadata: null,
    message: ReasonPhrases.OK,
  });
};

const insertToInvoiceAndSendMessage = async (
  seatId: string,
  userId: string
) => {
  const db = mongoClient.db("payment");
  const data = await db.collection("invoices").insertOne({
    seatId: seatId,
    userId: userId,
    status: PaymentStatus.PENDING,
  });

  try {
    await publishMessage(data.insertedId.toString());
  } catch (error) {
    // Roll back insertion
    await db.collection("invoices").findOneAndDelete({
      _id: data.insertedId,
    });
    console.log(
      ">> Failed to publish message after inserting invoice. Insertion rolled back."
    );

    throw error;
  }

  return data;
};
