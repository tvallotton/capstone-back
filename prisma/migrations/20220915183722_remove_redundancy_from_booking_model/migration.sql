/*
  Warnings:

  - You are about to drop the column `hasFinished` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "hasFinished",
ALTER COLUMN "end" DROP NOT NULL;
