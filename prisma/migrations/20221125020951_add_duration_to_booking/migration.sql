/*
  Warnings:

  - Added the required column `duration` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Singleton" AS ENUM ('Singleton');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "scheduledReturn" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" "Singleton" NOT NULL DEFAULT 'Singleton',
    "array" JSONB NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);
