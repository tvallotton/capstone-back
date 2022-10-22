/*
  Warnings:

  - You are about to drop the column `isAuth` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isAuth",
ADD COLUMN     "isValidated" BOOLEAN NOT NULL DEFAULT false;
