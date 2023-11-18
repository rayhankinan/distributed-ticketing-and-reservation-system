import { Elysia, t } from "elysia";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { PrismaClient, SlotStatus } from "@prisma/client";
import { jwt } from "@elysiajs/jwt";
import { bearer } from "@elysiajs/bearer";
import { serverTiming } from "@elysiajs/server-timing";
import { cors } from "@elysiajs/cors";

enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

const app = new Elysia()
  .use(
    jwt({
      secret: "dhika-jelek",
      schema: t.Object({
        userId: t.String(),
        role: t.Enum(Role),
      }),
    })
  )
  .use(bearer())
  .use(serverTiming())
  .use(cors())
  .derive(async ({ jwt, bearer }) => {
    const payload = await jwt.verify(bearer);

    return {
      payload,
    };
  })
  .decorate("db", new PrismaClient())
  .group("/event", (app) =>
    app.guard(
      {
        beforeHandle: ({ set, payload }) => {
          const isValid = payload && payload.role === Role.ADMIN;

          if (!isValid) {
            set.status = StatusCodes.FORBIDDEN;

            return {
              message: ReasonPhrases.FORBIDDEN,
            };
          }
        },
      },
      (app) =>
        app
          .get("/", async ({ set, db }) => {
            const data = await db.event.findMany();

            set.status = StatusCodes.OK;

            return {
              message: ReasonPhrases.OK,
              data,
            };
          })
          .post(
            "/",
            async ({ set, db, body }) => {
              const data = await db.event.create({
                data: body,
              });

              set.status = StatusCodes.CREATED;

              return {
                message: ReasonPhrases.CREATED,
                data,
              };
            },
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
            async ({ set, db, params, body }) => {
              const data = await db.event.update({
                where: params,
                data: body,
              });

              set.status = StatusCodes.OK;

              return {
                message: ReasonPhrases.OK,
                data,
              };
            },
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
            async ({ set, db, params }) => {
              const data = await db.event.delete({
                where: params,
              });

              set.status = StatusCodes.OK;

              return {
                message: ReasonPhrases.OK,
                data,
              };
            },
            {
              params: t.Object({
                id: t.String(),
              }),
            }
          )
    )
  )
  .group("/slot", (app) =>
    app.guard(
      {
        beforeHandle: ({ set, payload }) => {
          const isValid = payload && payload.role === Role.ADMIN;

          if (!isValid) {
            set.status = StatusCodes.FORBIDDEN;

            return {
              message: ReasonPhrases.FORBIDDEN,
            };
          }
        },
      },
      (app) =>
        app
          .get(
            "/",
            async ({ set, db, query }) => {
              const data = await db.slot.findMany({
                where: query,
              });

              set.status = StatusCodes.OK;

              return {
                message: ReasonPhrases.OK,
                data,
              };
            },
            {
              query: t.Object({
                eventId: t.Optional(t.String()),
              }),
            }
          )
          .post(
            "/",
            async ({ set, db, body }) => {
              const data = await db.slot.create({
                data: body,
              });

              set.status = StatusCodes.CREATED;

              return {
                message: ReasonPhrases.CREATED,
                data,
              };
            },
            {
              body: t.Object({
                eventId: t.String(),
                name: t.String(),
                status: t.Optional(t.Enum(SlotStatus)),
              }),
            }
          )
          .put(
            "/:id",
            async ({ set, db, params, body }) => {
              const data = await db.slot.update({
                where: params,
                data: body,
              });

              set.status = StatusCodes.OK;

              return {
                message: ReasonPhrases.OK,
                data,
              };
            },
            {
              params: t.Object({
                id: t.String(),
              }),
              body: t.Object({
                eventId: t.String(),
                name: t.String(),
                status: t.Optional(t.Enum(SlotStatus)),
              }),
            }
          )
          .delete(
            "/:id",
            async ({ set, db, params }) => {
              const data = await db.slot.delete({
                where: params,
              });

              set.status = StatusCodes.OK;

              return {
                message: ReasonPhrases.OK,
                data,
              };
            },
            {
              params: t.Object({
                id: t.String(),
              }),
            }
          )
    )
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
