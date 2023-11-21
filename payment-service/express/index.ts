// @deno-types="npm:@types/express"
import express from "npm:express";
// @deno-types="npm:@types/body-parser"
import bodyParser from "npm:body-parser";
import { expressjwt } from "npm:express-jwt";

import { createInvoiceHandler } from "./invoice-handler.ts";

export const expressApp = express().post(
  "/invoice",
  bodyParser.json(),
  expressjwt({
    secret: "dhika-jelek",
    algorithms: ["HS256"],
  }),
  createInvoiceHandler
);
