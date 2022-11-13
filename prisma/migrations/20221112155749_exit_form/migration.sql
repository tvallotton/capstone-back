-- AlterTable
ALTER TABLE "User" ADD COLUMN     "campus" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "howDidYouHearAboutUs" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "meansOfTransport" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "tripsPerWeek" INTEGER;

-- CreateTable
CREATE TABLE "ExitForm" (
    "id" SERIAL NOT NULL,
    "bicycleReview" INTEGER NOT NULL,
    "bicycleModelReview" INTEGER NOT NULL,
    "accessoryReview" INTEGER NOT NULL,
    "suggestions" TEXT NOT NULL DEFAULT '',
    "parkingSpot" TEXT NOT NULL,
    "bookingId" INTEGER NOT NULL,

    CONSTRAINT "ExitForm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExitForm_bookingId_key" ON "ExitForm"("bookingId");

-- AddForeignKey
ALTER TABLE "ExitForm" ADD CONSTRAINT "ExitForm_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
