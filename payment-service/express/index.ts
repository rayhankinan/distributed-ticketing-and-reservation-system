// @deno-types="npm:@types/express"
import express from "npm:express";
// @deno-types="npm:@types/body-parser"
import bodyParser from "npm:body-parser";
import morgan from "npm:morgan";
import { expressjwt } from "npm:express-jwt";

import { createInvoiceHandler } from "./invoice-handler.ts";
import { createRefundHandler } from "./refund-handler.ts";

export const expressApp = express();

expressApp.use(morgan("tiny"));

expressApp.post(
  "/invoice",
  bodyParser.json(),
  expressjwt({
    secret: "dhika-jelek",
    algorithms: ["HS256"],
  }),
  createInvoiceHandler
);

expressApp.post(
  "/refund",
  bodyParser.json(),
  expressjwt({
    secret: "dhika-jelek",
    algorithms: ["HS256"],
  }),
  createRefundHandler
);
