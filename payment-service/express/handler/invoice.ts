import { Request, Response } from "npm:@types/express";
import { mongoClient } from "../../mongo/index.ts";

type CreateInvoiceRequest = {
  seatId: string;
  userId: string;
};

export const createInvoiceHandler = async (req: Request, res: Response) => {
  const { seatId, userId }: CreateInvoiceRequest = req.body;

  if (!seatId || !userId) {
    res.status(400).json({
      message: "Missing required fields seatId and/or userId.",
    });
    return;
  }

  try {
    const db = mongoClient.db("payment");
    const collection = db.collection("invoices");

    const newInvoiceDocument = {
      id: crypto.randomUUID(),
      seatId: seatId,
      userId: userId,
      status: "PENDING",
    };
    await collection.insertOne(newInvoiceDocument);

    res.status(200).json({
      data: newInvoiceDocument,
    });
  } catch (error) {
    console.log("Error at createInvoiceHandler", error);
    res.status(500);
  }
};
