/*
  Warnings:

  - You are about to drop the `Slot` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "SeatStatus" AS ENUM ('OPEN', 'ON_GOING', 'BOOKED');

-- DropForeignKey
ALTER TABLE "Slot" DROP CONSTRAINT "Slot_eventId_fkey";

-- DropTable
DROP TABLE "Slot";

-- DropEnum
DROP TYPE "SlotStatus";

-- CreateTable
CREATE TABLE "Seat" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "eventId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" "SeatStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Seat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Seat_eventId_name_key" ON "Seat"("eventId", "name");

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
