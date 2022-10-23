/*
  Warnings:

  - You are about to drop the column `lights` on the `Bicycle` table. All the data in the column will be lost.
  - You are about to drop the column `reflector` on the `Bicycle` table. All the data in the column will be lost.
  - You are about to drop the column `ulock` on the `Bicycle` table. All the data in the column will be lost.
  - Added the required column `userId` to the `BicycleHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bicycle" DROP COLUMN "lights",
DROP COLUMN "reflector",
DROP COLUMN "ulock";

-- AlterTable
ALTER TABLE "BicycleHistory" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "lights" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "reflector" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "ulock" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "BicycleHistory" ADD CONSTRAINT "BicycleHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
