/*
  Warnings:

  - You are about to drop the column `occuppancy` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "occuppancy",
ADD COLUMN     "occupancy" TEXT NOT NULL DEFAULT '';
