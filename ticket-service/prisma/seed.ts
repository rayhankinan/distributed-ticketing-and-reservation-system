import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {
    const firstEvent = await tx.event.create({
      data: {
        name: "Konser Yoasobi",
        lineup: ["Yoasobi", "Aimer", "Kenshi Yonezu"],
        startTime: new Date("2021-12-31T20:00:00.000Z"),
        endTime: new Date("2022-01-01T01:00:00.000Z"),
      },
      select: {
        id: true,
      },
    });

    console.log(firstEvent);

    const firstEventSeats = await tx.seat.createMany({
      data: [
        {
          eventId: firstEvent.id,
          name: "1A",
        },
        {
          eventId: firstEvent.id,
          name: "1B",
        },
        {
          eventId: firstEvent.id,
          name: "1C",
        },
      ],
    });

    console.log(firstEventSeats);

    const secondEvent = await tx.event.create({
      data: {
        name: "Konser Aimer",
        lineup: ["Aimer", "Kenshi Yonezu"],
        startTime: new Date("2021-12-31T20:00:00.000Z"),
        endTime: new Date("2022-01-01T01:00:00.000Z"),
      },
    });

    console.log(secondEvent);

    const secondEventSeats = await tx.seat.createMany({
      data: [
        {
          eventId: secondEvent.id,
          name: "1A",
        },
        {
          eventId: secondEvent.id,
          name: "1B",
        },
        {
          eventId: secondEvent.id,
          name: "1C",
        },
      ],
    });

    console.log(secondEventSeats);

    const thirdEvent = await tx.event.create({
      data: {
        name: "Konser Kenshi Yonezu",
        lineup: ["Kenshi Yonezu"],
        startTime: new Date("2021-12-31T20:00:00.000Z"),
        endTime: new Date("2022-01-01T01:00:00.000Z"),
      },
    });

    console.log(thirdEvent);

    const thirdEventSeats = await tx.seat.createMany({
      data: [
        {
          eventId: thirdEvent.id,
          name: "1A",
        },
        {
          eventId: thirdEvent.id,
          name: "1B",
        },
        {
          eventId: thirdEvent.id,
          name: "1C",
        },
      ],
    });

    console.log(thirdEventSeats);
  });
}

main();
