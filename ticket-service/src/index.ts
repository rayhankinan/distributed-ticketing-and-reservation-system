import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { bearer } from "@elysiajs/bearer";
import { serverTiming } from "@elysiajs/server-timing";
import { cors } from "@elysiajs/cors";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { PrismaClient, SeatStatus } from "@prisma/client";

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
    app
      .guard(
        {
          beforeHandle: ({ set, payload }) => {
            if (!payload) {
              set.status = StatusCodes.FORBIDDEN;

              return {
                data: null,
                message: ReasonPhrases.FORBIDDEN,
              };
            }
          },
        },
        (app) =>
          app.get("/", async ({ set, db }) => {
            const data = await db.event.findMany();

            set.status = StatusCodes.OK;

            return {
              data,
              message: ReasonPhrases.OK,
            };
          })
      )
      .guard(
        {
          beforeHandle: ({ set, payload }) => {
            if (!payload || payload.role !== Role.ADMIN) {
              set.status = StatusCodes.FORBIDDEN;

              return {
                data: null,
                message: ReasonPhrases.FORBIDDEN,
              };
            }
          },
        },
        (app) =>
          app
            .post(
              "/",
              async ({ set, db, body }) => {
                const data = await db.event.create({
                  data: body,
                });

                set.status = StatusCodes.CREATED;

                return {
                  data,
                  message: ReasonPhrases.CREATED,
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
                  data,
                  message: ReasonPhrases.OK,
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
                  data,
                  message: ReasonPhrases.OK,
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
  .group("/seat", (app) =>
    app
      .guard(
        {
          beforeHandle: ({ set, payload }) => {
            if (!payload) {
              set.status = StatusCodes.FORBIDDEN;

              return {
                data: null,
                message: ReasonPhrases.FORBIDDEN,
              };
            }
          },
        },
        (app) =>
          app.get(
            "/",
            async ({ set, db, query }) => {
              const data = await db.seat.findMany({
                where: query,
              });

              set.status = StatusCodes.OK;

              return {
                data,
                message: ReasonPhrases.OK,
              };
            },
            {
              query: t.Object({
                eventId: t.Optional(t.String()),
              }),
            }
          )
      )
      .guard(
        {
          beforeHandle: ({ set, payload }) => {
            if (!payload || payload.role !== Role.USER) {
              set.status = StatusCodes.FORBIDDEN;

              return {
                data: null,
                message: ReasonPhrases.FORBIDDEN,
              };
            }
          },
        },
        (app) =>
          app
            .post(
              "/reserve",
              async ({ set, db, body }) => {
                const seat = await db.seat.findUnique({
                  where: body,
                  select: {
                    status: true,
                  },
                });

                if (!seat) {
                  set.status = StatusCodes.NOT_FOUND;

                  return {
                    data: null,
                    message: ReasonPhrases.NOT_FOUND,
                  };
                }

                if (seat.status !== SeatStatus.OPEN) {
                  set.status = StatusCodes.CONFLICT;

                  return {
                    data: null,
                    message: ReasonPhrases.CONFLICT,
                  };
                }

                const data = await db.seat.update({
                  where: body,
                  data: {
                    status: SeatStatus.ON_GOING,
                  },
                });

                // TODO: Queue to Payment Service

                set.status = StatusCodes.OK;

                return {
                  data,
                  message: ReasonPhrases.OK,
                };
              },
              {
                body: t.Object({
                  id: t.String(),
                }),
              }
            )
            .post(
              "/webhook",
              async ({ set, db, body }) => {
                const seat = await db.seat.findUnique({
                  where: body,
                  select: {
                    status: true,
                  },
                });

                if (!seat) {
                  set.status = StatusCodes.NOT_FOUND;

                  return {
                    data: null,
                    message: ReasonPhrases.NOT_FOUND,
                  };
                }

                if (seat.status !== SeatStatus.ON_GOING) {
                  set.status = StatusCodes.CONFLICT;

                  return {
                    data: null,
                    message: ReasonPhrases.CONFLICT,
                  };
                }

                const data = await db.seat.update({
                  where: body,
                  data: {
                    status: SeatStatus.BOOKED,
                  },
                });

                // TODO: Generate PDF and send the link to Client Service

                set.status = StatusCodes.OK;

                return {
                  data,
                  message: ReasonPhrases.OK,
                };
              },
              {
                body: t.Object({
                  id: t.String(),
                }),
              }
            )
      )
      .guard(
        {
          beforeHandle: ({ set, payload }) => {
            const isValid = payload && payload.role === Role.ADMIN;

            if (!isValid) {
              set.status = StatusCodes.FORBIDDEN;

              return {
                data: null,
                message: ReasonPhrases.FORBIDDEN,
              };
            }
          },
        },
        (app) =>
          app
            .post(
              "/",
              async ({ set, db, body }) => {
                const data = await db.seat.create({
                  data: body,
                });

                set.status = StatusCodes.CREATED;

                return {
                  data,
                  message: ReasonPhrases.CREATED,
                };
              },
              {
                body: t.Object({
                  eventId: t.String(),
                  name: t.String(),
                  status: t.Optional(t.Enum(SeatStatus)),
                }),
              }
            )
            .put(
              "/:id",
              async ({ set, db, params, body }) => {
                const data = await db.seat.update({
                  where: params,
                  data: body,
                });

                set.status = StatusCodes.OK;

                return {
                  data,
                  message: ReasonPhrases.OK,
                };
              },
              {
                params: t.Object({
                  id: t.String(),
                }),
                body: t.Object({
                  eventId: t.String(),
                  name: t.String(),
                  status: t.Optional(t.Enum(SeatStatus)),
                }),
              }
            )
            .delete(
              "/:id",
              async ({ set, db, params }) => {
                const data = await db.seat.delete({
                  where: params,
                });

                set.status = StatusCodes.OK;

                return {
                  data,
                  message: ReasonPhrases.OK,
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
