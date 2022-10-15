/*
  Warnings:

  - You are about to drop the column `bornDate` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "bornDate",
ADD COLUMN     "birthday" TIMESTAMP(3);
