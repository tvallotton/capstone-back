-- AlterTable
ALTER TABLE "Bicycle" ADD COLUMN     "fleet" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "lights" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "reflector" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "ulock" TEXT NOT NULL DEFAULT '';
