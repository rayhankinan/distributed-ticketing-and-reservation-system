import { Elysia, t } from "elysia";
import { PrismaClient } from "@prisma/client";

const app = new Elysia()
  .decorate("db", new PrismaClient())
  .group("/events", (app) =>
    app
      .get("/", async ({ db }) => await db.event.findMany())
      .get(
        "/:id",
        async ({ db, params }) =>
          await db.event.findUnique({
            where: params,
          }),
        {
          params: t.Object({ id: t.String() }),
        }
      )
      .post(
        "/",
        async ({ db, body }) =>
          await db.event.create({
            data: body,
          }),
        {
          body: t.Object({
            name: t.String(),
            lineup: t.Array(t.String()),
            description: t.Optional(t.String()),
            homepage: t.Optional(t.String()),
            startTime: t.String({ format: "date-time" }),
            endTime: t.String({ format: "date-time" }),
          }),
        }
      )
      .put(
        "/:id",
        async ({ db, params, body }) =>
          await db.event.update({
            where: params,
            data: body,
          }),
        {
          body: t.Object({
            name: t.String(),
            lineup: t.Array(t.String()),
            description: t.Optional(t.String()),
            homepage: t.Optional(t.String()),
            startTime: t.String({ format: "date-time" }),
            endTime: t.String({ format: "date-time" }),
          }),
          params: t.Object({
            id: t.String(),
          }),
        }
      )
      .delete(
        "/:id",
        async ({ db, params }) =>
          await db.event.delete({
            where: params,
          }),
        {
          params: t.Object({
            id: t.String(),
          }),
        }
      )
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
