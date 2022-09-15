/*
  Warnings:

  - You are about to drop the column `setAside` on the `BicycleModel` table. All the data in the column will be lost.
  - Added the required column `description` to the `BicycleModel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BicycleModel" DROP COLUMN "setAside",
ADD COLUMN     "description" TEXT NOT NULL;
