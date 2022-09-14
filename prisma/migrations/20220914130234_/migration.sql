/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Submission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bicycleModelId` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "bicycleModelId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Submission_userId_key" ON "Submission"("userId");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_bicycleModelId_fkey" FOREIGN KEY ("bicycleModelId") REFERENCES "BicycleModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
