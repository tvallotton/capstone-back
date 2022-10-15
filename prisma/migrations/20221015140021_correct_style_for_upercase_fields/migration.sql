/*
  Warnings:

  - You are about to drop the column `BornDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `LastName` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "BornDate",
DROP COLUMN "LastName",
ADD COLUMN     "bornDate" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "lastName" TEXT NOT NULL DEFAULT '';
