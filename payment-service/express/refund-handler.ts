// @deno-types="npm:@types/express"
import { type Response } from "npm:express";
import { type Request } from "npm:express-jwt";
import { ReasonPhrases, StatusCodes } from "npm:http-status-codes";

import { mongoClient } from "../mongo/index.ts";
import { publishMessage } from "../redis/publish.ts";
import { requestSchema } from "../schema/index.ts";
import { PaymentStatus } from "../enum/index.ts";

export const createRefundHandler = async (
  req: Request<{
    userId: string;
  }>,
  res: Response
) => {
  try {
    await createRefund(req, res);
  } catch (error) {
    console.log(`>> Failed creating refund: ${error}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      data: null,
      metadata: null,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

const createRefund = async (
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

  const parsedRequest = requestSchema.safeParse(req.body);
  if (!parsedRequest.success) {
    res.status(StatusCodes.BAD_REQUEST).json({
      data: null,
      metadata: null,
      message: ReasonPhrases.BAD_REQUEST,
    });
    return;
  }

  const data = await insertToRefundAndSendMessage(
    parsedRequest.data.seatId,
    req.auth.userId
  );

  res.status(StatusCodes.OK).json({
    data,
    metadata: null,
    message: ReasonPhrases.OK,
  });
};

const insertToRefundAndSendMessage = async (seatId: string, userId: string) => {
  const db = mongoClient.db("payment");
  const data = await db.collection("invoices").insertOne({
    seatId: seatId,
    userId: userId,
    status: PaymentStatus.PENDING,
  });

  try {
    await publishMessage("refund", data.insertedId.toString());
  } catch (error) {
    // Roll back insertion
    await db.collection("invoices").findOneAndDelete({
      _id: data.insertedId,
    });
    console.log(
      ">> Failed to publish message after inserting refund. Insertion rolled back."
    );

    throw error;
  }

  return data;
};
