import express from "npm:express";
import bodyParser from "npm:body-parser";
import { createInvoiceHandler } from "./handler/invoice.ts";

export const expressApp = new express();

expressApp.post("/invoice", bodyParser.json(), createInvoiceHandler);
