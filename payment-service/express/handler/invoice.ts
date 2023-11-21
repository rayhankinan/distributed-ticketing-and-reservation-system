import { Request, Response } from "npm:@types/express";
import { z } from "npm:zod";
import { mongoClient } from "../../mongo/index.ts";
import { publishMessage } from "../../redis/publish.ts";

const schema = z.object({
  seatId: z.string(),
  userId: z.string(),
});

export const createInvoiceHandler = async (req: Request, res: Response) => {
  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid request body.",
      errors: parsed.error,
    });
    return;
  }

  try {
    const db = mongoClient.db("payment");
    const collection = db.collection("invoices");

    const newInvoiceDocument = {
      id: crypto.randomUUID(),
      seatId: parsed.data.seatId,
      userId: parsed.data.userId,
      status: "PENDING",
    };

    await collection.insertOne(newInvoiceDocument);

    await publishMessage(newInvoiceDocument.id);

    res.status(200).json({
      data: newInvoiceDocument,
    });
  } catch (error) {
    console.log("Error at createInvoiceHandler", error);

    res.status(500).json({
      message: "Internal server error.",
      errors: error,
    });
  }
};
