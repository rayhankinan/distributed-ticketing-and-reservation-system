import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { bearer } from "@elysiajs/bearer";
import { serverTiming } from "@elysiajs/server-timing";
import { cors } from "@elysiajs/cors";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { PrismaClient, SeatStatus } from "@prisma/client";
import { createClient } from "redis";
import axios from "axios";
import { createHmac } from "crypto";

import { Role, TicketStatus } from "./enum";

const app = new Elysia()
  .onError(({ set }) => {
    set.status = StatusCodes.INTERNAL_SERVER_ERROR;

    return {
      data: null,
      metadata: null,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    };
  })
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
  .use(
    cors({
      origin: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )
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
  .derive(({ bearer }) => {
    const axiosTicketInstance = axios.create({
      baseURL: "http://api.ticket-service.docker-compose:3000",
      headers: {
        Authorization: `Bearer ${bearer}`,
      },
    });

    return {
      axiosTicketInstance,
    };
  })
  .derive(async () => {
    const redis = createClient({
      url: "redis://ticket-redis.docker-compose:6379",
    });

    await redis.connect();

    return {
      redis,
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
              async ({ set, body, db }) => {
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
              async ({ set, params, body, db }) => {
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
              async ({ set, params, db }) => {
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
            async ({ set, query, db }) => {
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
              async ({
                set,
                body,
                payload,
                db,
                redis,
                axiosPaymentInstance,
              }) => {
                const isFailed = Math.random() < 0; // NOTE: Replace with 0.2 if system is stable

                if (isFailed) {
                  set.status = StatusCodes.INTERNAL_SERVER_ERROR;

                  return {
                    data: null,
                    metadata: null,
                    message: ReasonPhrases.INTERNAL_SERVER_ERROR,
                  };
                }

                if (!payload) {
                  set.status = StatusCodes.FORBIDDEN;

                  return {
                    data: null,
                    metadata: null,
                    message: ReasonPhrases.FORBIDDEN,
                  };
                }

                // Update seat status to on going, and add user to queue if seat is already booked or on going
                const { data, metadata, status, message } =
                  await db.$transaction(async (tx) => {
                    // Check if seat is still open
                    const seat = await tx.seat.findUnique({
                      where: body,
                      select: {
                        status: true,
                      },
                    });

                    if (!seat)
                      return {
                        data: null,
                        metadata: {
                          queueLength: 0,
                        },
                        status: StatusCodes.NOT_FOUND,
                        message: ReasonPhrases.NOT_FOUND,
                      };

                    // If seat is already booked or on going, then add to queue
                    if (seat.status !== SeatStatus.OPEN) {
                      const queueLength = await redis.lPush(
                        `queue:${body.id}`,
                        payload.userId
                      );

                      return {
                        data: null,
                        metadata: {
                          queueLength,
                        },
                        status: StatusCodes.CREATED,
                        message: ReasonPhrases.CREATED,
                      };
                    }

                    const data = await tx.seat.update({
                      where: body,
                      data: {
                        status: SeatStatus.ON_GOING,
                      },
                    });

                    return {
                      data,
                      metadata: {
                        queueLength: 0,
                      },
                      status: StatusCodes.CREATED,
                      message: ReasonPhrases.CREATED,
                    };
                  });

                // If queue length is more than 0, then immediately return
                if (metadata.queueLength > 0) {
                  set.status = status;

                  return {
                    data,
                    metadata,
                    message,
                  };
                }

                // Call payment service for payment
                await axiosPaymentInstance.post("/invoice", body);

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
            .post(
              "/cancel",
              async ({ set, body, payload, db, axiosPaymentInstance }) => {
                if (!payload) {
                  set.status = StatusCodes.FORBIDDEN;

                  return {
                    data: null,
                    metadata: null,
                    message: ReasonPhrases.FORBIDDEN,
                  };
                }

                // Update seat status to on going
                const { data, metadata, status, message } =
                  await db.$transaction(async (tx) => {
                    // Check if seat is booked
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

                    // If seat is not booked, then return conflict
                    if (seat.status !== SeatStatus.BOOKED)
                      return {
                        data: null,
                        metadata: null,
                        status: StatusCodes.CONFLICT,
                        message: ReasonPhrases.CONFLICT,
                      };

                    // Update seat status to on going
                    const data = await tx.seat.update({
                      where: body,
                      data: {
                        status: SeatStatus.ON_GOING,
                      },
                    });

                    return {
                      data,
                      metadata: null,
                      status: StatusCodes.CREATED,
                      message: ReasonPhrases.CREATED,
                    };
                  });

                // Call payment service to refund the payment
                await axiosPaymentInstance.post("/refund", body);

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
            .post(
              "/webhook-success",
              async ({ set, body, payload, db }) => {
                if (!payload) {
                  set.status = StatusCodes.FORBIDDEN;

                  return {
                    data: null,
                    metadata: null,
                    message: ReasonPhrases.FORBIDDEN,
                  };
                }

                // Update seat status to booked
                const { data, metadata, status, message } =
                  await db.$transaction(async (tx) => {
                    // Check if seat is still on going
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

                    // Update seat status to booked
                    const data = await tx.seat.update({
                      where: body,
                      data: {
                        status: SeatStatus.BOOKED,
                      },
                    });

                    return {
                      data,
                      metadata: null,
                      status: StatusCodes.CREATED,
                      message: ReasonPhrases.CREATED,
                    };
                  });

                // Call client service to notify user that the ticket is ready
                const pdfData = Buffer.from(
                  JSON.stringify({
                    userId: payload.userId,
                    seatId: body.id,
                    status: TicketStatus.SUCCESS,
                  })
                ).toString("base64url");

                const pdfHash = createHmac("sha256", "dhika-jelek")
                  .update(pdfData)
                  .digest("base64url");

                const rawURL = new URL("http://cdn.ticket-pdf.localhost");

                rawURL.searchParams.append("data", pdfData);
                rawURL.searchParams.append("hash", pdfHash);

                const url = rawURL.toString();
                console.log(url); // TODO: Remove this and replace with client service

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
            .post(
              "/webhook-refund",
              async ({
                set,
                body,
                payload,
                jwt,
                db,
                redis,
                axiosTicketInstance,
              }) => {
                if (!payload) {
                  set.status = StatusCodes.FORBIDDEN;

                  return {
                    data: null,
                    metadata: null,
                    message: ReasonPhrases.FORBIDDEN,
                  };
                }

                // Update seat status to open
                const { data, metadata, status, message } =
                  await db.$transaction(async (tx) => {
                    // Check if seat is still on going
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

                    // If seat is not on going, then return conflict
                    if (seat.status !== SeatStatus.ON_GOING)
                      return {
                        data: null,
                        metadata: null,
                        status: StatusCodes.CONFLICT,
                        message: ReasonPhrases.CONFLICT,
                      };

                    // Update seat status to open
                    const data = await tx.seat.update({
                      where: body,
                      data: {
                        status: SeatStatus.OPEN,
                      },
                    });

                    return {
                      data,
                      metadata: null,
                      status: StatusCodes.CREATED,
                      message: ReasonPhrases.CREATED,
                    };
                  });

                // Call client service to notify user that the ticket is refunded
                const pdfData = Buffer.from(
                  JSON.stringify({
                    userId: payload.userId,
                    seatId: body.id,
                    status: TicketStatus.REFUNDED,
                  })
                ).toString("base64url");

                const pdfHash = createHmac("sha256", "dhika-jelek")
                  .update(pdfData)
                  .digest("base64url");

                const rawURL = new URL("http://cdn.ticket-pdf.localhost");

                rawURL.searchParams.append("data", pdfData);
                rawURL.searchParams.append("hash", pdfHash);

                const url = rawURL.toString();
                console.log(url); // TODO: Remove this and replace with client service

                // Call ticket service for new reservation from queue
                const userId = await redis.rPop(`queue:${body.id}`);

                if (!userId) {
                  set.status = status;

                  return {
                    data,
                    metadata: null,
                    message,
                  };
                }

                const bearer = await jwt.sign({
                  userId,
                  role: Role.USER,
                });

                await axiosTicketInstance.post("/seat/reserve", body, {
                  headers: {
                    Authorization: `Bearer ${bearer}`,
                  },
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
            .post(
              "/webhook-failed",
              async ({
                set,
                body,
                payload,
                jwt,
                db,
                redis,
                axiosTicketInstance,
              }) => {
                if (!payload) {
                  set.status = StatusCodes.FORBIDDEN;

                  return {
                    data: null,
                    metadata: null,
                    message: ReasonPhrases.FORBIDDEN,
                  };
                }

                // Update seat status to open
                const { data, metadata, status, message } =
                  await db.$transaction(async (tx) => {
                    // Check if seat is still on going
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

                    // If seat is not on going, then return conflict
                    if (seat.status !== SeatStatus.ON_GOING)
                      return {
                        data: null,
                        metadata: null,
                        status: StatusCodes.CONFLICT,
                        message: ReasonPhrases.CONFLICT,
                      };

                    // Update seat status to open
                    const data = await tx.seat.update({
                      where: body,
                      data: {
                        status: SeatStatus.OPEN,
                      },
                    });

                    return {
                      data,
                      metadata: null,
                      status: StatusCodes.CREATED,
                      message: ReasonPhrases.CREATED,
                    };
                  });

                // Call client service to notify user that the ticket failed to be booked
                const pdfData = Buffer.from(
                  JSON.stringify({
                    userId: payload.userId,
                    seatId: body.id,
                    status: TicketStatus.FAILED,
                  })
                ).toString("base64url");

                const pdfHash = createHmac("sha256", "dhika-jelek")
                  .update(pdfData)
                  .digest("base64url");

                const rawURL = new URL("http://cdn.ticket-pdf.localhost");

                rawURL.searchParams.append("data", pdfData);
                rawURL.searchParams.append("hash", pdfHash);

                const url = rawURL.toString();
                console.log(url); // TODO: Remove this and replace with client service

                // Call ticket service for new reservation from queue
                const userId = await redis.rPop(`queue:${body.id}`);

                if (!userId) {
                  set.status = status;

                  return {
                    data,
                    metadata: null,
                    message,
                  };
                }

                const bearer = await jwt.sign({
                  userId,
                  role: Role.USER,
                });

                await axiosTicketInstance.post("/seat/reserve", body, {
                  headers: {
                    Authorization: `Bearer ${bearer}`,
                  },
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
              async ({ set, body, db }) => {
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
              async ({ set, params, body, db }) => {
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
              async ({ set, params, db }) => {
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
