// @deno-types="npm:@types/express"
import { type Response } from "npm:express";
import { z } from "npm:zod";
import { type Request } from "npm:express-jwt";
import { ReasonPhrases, StatusCodes } from "npm:http-status-codes";

import { mongoClient } from "../mongo/index.ts";
import { publishMessage } from "../redis/publish.ts";
import { PaymentStatus } from "../enum/index.ts";

const schema = z.object({
  seatId: z.string().uuid(),
});

const invoiceHandler = async (
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

  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    res.status(StatusCodes.BAD_REQUEST).json({
      data: null,
      metadata: null,
      message: ReasonPhrases.BAD_REQUEST,
    });
    return;
  }

  const db = mongoClient.db("payment");
  const data = await db.collection("invoices").insertOne({
    seatId: parsed.data.seatId,
    userId: req.auth.userId,
    status: PaymentStatus.PENDING,
  }); // TODO: Agak susah untuk dibuat atomic dengan message queue

  await publishMessage(data.insertedId.toString()); // TODO: Agak susah untuk dibuat atomic dengan database

  res.status(StatusCodes.OK).json({
    data,
    metadata: null,
    message: ReasonPhrases.OK,
  });
};

export const createInvoiceHandler = async (
  req: Request<{
    userId: string;
  }>,
  res: Response
) =>
  await invoiceHandler(req, res).catch(() => {
    console.log(">> Failed creating invoice");

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      data: null,
      metadata: null,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  });
