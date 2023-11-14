import { Elysia } from "elysia";
import { PrismaClient } from "./generated/client";

const app = new Elysia()
  .decorate("db", new PrismaClient())
  .group("/events", (app) =>
    app.get("/", async ({ db }) => await db.event.findMany())
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
