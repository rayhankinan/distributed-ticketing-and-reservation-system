import express from "npm:express";
import bodyParser from "npm:body-parser";
import { Request, Response } from "npm:@types/express";
import { createInvoiceHandler } from "./handler/invoice.ts";

export const expressApp = new express();

expressApp.post(
  "/invoice",
  bodyParser.json(),
  (req: Request, res: Response) => {
    createInvoiceHandler(req, res);
  }
);
