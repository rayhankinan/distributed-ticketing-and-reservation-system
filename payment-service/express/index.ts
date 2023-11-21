import express from "npm:express";
import { Request, Response } from "npm:@types/express";

export const expressApp = new express();

expressApp.get("/", (_req: Request, res: Response) => {
  res.send("Hello World!");
});