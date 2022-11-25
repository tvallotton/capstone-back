/*
  Warnings:

  - You are about to drop the column `scheduledReturn` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "scheduledReturn",
ADD COLUMN     "returnSchedule" TIMESTAMP(3),
ALTER COLUMN "duration" SET DEFAULT 3;

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "pickupSchedule" TIMESTAMP(3);
