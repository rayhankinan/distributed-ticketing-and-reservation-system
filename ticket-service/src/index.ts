import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { bearer } from "@elysiajs/bearer";
import { serverTiming } from "@elysiajs/server-timing";
import { cors } from "@elysiajs/cors";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { PrismaClient, SeatStatus } from "@prisma/client";
import axios from "axios";
import { createHmac } from "crypto";

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
      alg: "HS256",
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
  .derive(({ bearer }) => {
    const axiosPaymentInstance = axios.create({
      baseURL: "http://api.payment-service.docker-compose:3002",
      headers: {
        Authorization: `Bearer ${bearer}`,
      },
    });

    return {
      axiosPaymentInstance,
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
                metadata: null,
                message: ReasonPhrases.FORBIDDEN,
              };
            }
          },
        },
        (app) =>
          app.get("/", async ({ set, db }) => {
            const { data, metadata, status, message } = await db.$transaction(
              async (tx) => {
                const data = await tx.event.findMany();

                return {
                  data,
                  metadata: null,
                  status: StatusCodes.OK,
                  message: ReasonPhrases.OK,
                };
              }
            );

            set.status = status;

            return {
              data,
              metadata,
              message,
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
                metadata: null,
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
                const { data, metadata, status, message } =
                  await db.$transaction(async (tx) => {
                    const data = await tx.event.create({
                      data: body,
                    });

                    return {
                      data,
                      metadata: null,
                      status: StatusCodes.CREATED,
                      message: ReasonPhrases.CREATED,
                    };
                  });

                set.status = status;

                return {
                  data,
                  metadata,
                  message,
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
                const { data, metadata, status, message } =
                  await db.$transaction(async (tx) => {
                    const data = await tx.event.update({
                      where: params,
                      data: body,
                    });

                    return {
                      data,
                      metadata: null,
                      status: StatusCodes.OK,
                      message: ReasonPhrases.OK,
                    };
                  });

                set.status = status;

                return {
                  data,
                  metadata,
                  message,
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
                const { data, metadata, status, message } =
                  await db.$transaction(async (tx) => {
                    const data = await tx.event.delete({
                      where: params,
                    });

                    return {
                      data,
                      metadata: null,
                      status: StatusCodes.OK,
                      message: ReasonPhrases.OK,
                    };
                  });

                set.status = status;

                return {
                  data,
                  metadata,
                  message,
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
                metadata: null,
                message: ReasonPhrases.FORBIDDEN,
              };
            }
          },
        },
        (app) =>
          app.get(
            "/",
            async ({ set, db, query }) => {
              const { data, metadata, status, message } = await db.$transaction(
                async (tx) => {
                  const data = await tx.seat.findMany({
                    where: query,
                  });

                  return {
                    data,
                    metadata: null,
                    status: StatusCodes.OK,
                    message: ReasonPhrases.OK,
                  };
                }
              );

              set.status = status;

              return {
                data,
                metadata,
                message,
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
                metadata: null,
                message: ReasonPhrases.FORBIDDEN,
              };
            }
          },
        },
        (app) =>
          app
            .post(
              "/reserve",
              async ({ set, db, body, axiosPaymentInstance }) => {
                const { data, metadata, status, message } =
                  await db.$transaction(async (tx) => {
                    const isFailed = Math.random() < 0; // TODO: Replace with 0.2 if system is stable

                    if (isFailed)
                      return {
                        data: null,
                        metadata: null,
                        status: StatusCodes.INTERNAL_SERVER_ERROR,
                        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
                      };

                    const seat = await tx.seat.findUnique({
                      where: body,
                      select: {
                        status: true,
                      },
                    });

                    if (!seat)
                      return {
                        data: null,
                        metadata: null,
                        status: StatusCodes.NOT_FOUND,
                        message: ReasonPhrases.NOT_FOUND,
                      };

                    // TODO: If seat is already booked, add to queue
                    if (seat.status !== SeatStatus.OPEN)
                      return {
                        data: null,
                        metadata: null,
                        status: StatusCodes.CONFLICT,
                        message: ReasonPhrases.CONFLICT,
                      };

                    const data = await tx.seat.update({
                      where: body,
                      data: {
                        status: SeatStatus.ON_GOING,
                      },
                    });

                    // Call payment service for payment
                    await axiosPaymentInstance.post("/invoice", {
                      seatId: body.id,
                    });

                    return {
                      data,
                      metadata: null,
                      status: StatusCodes.CREATED,
                      message: ReasonPhrases.CREATED,
                    };
                  });

                set.status = status;

                return {
                  data,
                  metadata,
                  message,
                };
              },
              {
                body: t.Object({
                  id: t.String(),
                }),
              }
            )
            .post("/cancel", async () => {
              // TODO: Dequeue if there is a queue
              // TODO: Call payment service for refund

              return {
                data: null,
                metadata: null,
                message: ReasonPhrases.CREATED,
              };
            })
            .post(
              "/webhook-success",
              async ({ set, db, body, payload }) => {
                const { data, metadata, status, message } =
                  await db.$transaction(async (tx) => {
                    if (!payload)
                      return {
                        data: null,
                        metadata: null,
                        status: StatusCodes.FORBIDDEN,
                        message: ReasonPhrases.FORBIDDEN,
                      };

                    const seat = await tx.seat.findUnique({
                      where: body,
                      select: {
                        status: true,
                      },
                    });

                    if (!seat)
                      return {
                        data: null,
                        metadata: null,
                        status: StatusCodes.NOT_FOUND,
                        message: ReasonPhrases.NOT_FOUND,
                      };

                    if (seat.status !== SeatStatus.ON_GOING)
                      return {
                        data: null,
                        metadata: null,
                        status: StatusCodes.CONFLICT,
                        message: ReasonPhrases.CONFLICT,
                      };

                    const data = await tx.seat.update({
                      where: body,
                      data: {
                        status: SeatStatus.BOOKED,
                      },
                    });

                    const pdfData = Buffer.from(
                      JSON.stringify({
                        userId: payload.userId,
                      })
                    ).toString("base64url");

                    const pdfHash = createHmac("sha256", "dhika-jelek")
                      .update(pdfData)
                      .digest("base64url");

                    const rawURL = new URL("http://cdn.ticket-pdf.localhost");

                    rawURL.searchParams.append("data", pdfData);
                    rawURL.searchParams.append("hash", pdfHash);

                    const url = rawURL.toString();

                    return {
                      data,
                      metadata: {
                        url,
                      },
                      status: StatusCodes.CREATED,
                      message: ReasonPhrases.CREATED,
                    };
                  });

                set.status = status;

                return {
                  data,
                  metadata,
                  message,
                };
              },
              {
                body: t.Object({
                  id: t.String(),
                }),
              }
            )
            .post("/webhook-failed", async () => {
              // TODO: Dequeue if there is a queue

              return {
                data: null,
                metadata: null,
                message: ReasonPhrases.CREATED,
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
                metadata: null,
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
                const { data, metadata, status, message } =
                  await db.$transaction(async (tx) => {
                    const data = await tx.seat.create({
                      data: body,
                    });

                    return {
                      data,
                      metadata: null,
                      status: StatusCodes.CREATED,
                      message: ReasonPhrases.CREATED,
                    };
                  });

                set.status = status;

                return {
                  data,
                  metadata,
                  message,
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
                const { data, metadata, status, message } =
                  await db.$transaction(async (tx) => {
                    const data = await tx.seat.update({
                      where: params,
                      data: body,
                    });

                    return {
                      data,
                      metadata: null,
                      status: StatusCodes.OK,
                      message: ReasonPhrases.OK,
                    };
                  });

                set.status = status;

                return {
                  data,
                  metadata,
                  message,
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
                const { data, metadata, status, message } =
                  await db.$transaction(async (tx) => {
                    const data = await tx.seat.delete({
                      where: params,
                    });

                    return {
                      data,
                      metadata: null,
                      status: StatusCodes.OK,
                      message: ReasonPhrases.OK,
                    };
                  });

                set.status = status;

                return {
                  data,
                  metadata,
                  message,
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
