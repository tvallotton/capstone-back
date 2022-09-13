-- CreateEnum
CREATE TYPE "BicycleStatus" AS ENUM ('HABILITADA', 'REPARACION', 'INHABILITADA');

-- CreateTable
CREATE TABLE "Bicycle" (
    "id" SERIAL NOT NULL,
    "qrCode" TEXT NOT NULL,
    "status" "BicycleStatus" NOT NULL,
    "modelId" INTEGER NOT NULL,

    CONSTRAINT "Bicycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BicycleModel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "setAside" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT,

    CONSTRAINT "BicycleModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Borrow" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bicycleId" INTEGER NOT NULL,
    "hasFinished" BOOLEAN NOT NULL,
    "start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Borrow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bicycle_qrCode_key" ON "Bicycle"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "BicycleModel_name_key" ON "BicycleModel"("name");

-- AddForeignKey
ALTER TABLE "Bicycle" ADD CONSTRAINT "Bicycle_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "BicycleModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Borrow" ADD CONSTRAINT "Borrow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Borrow" ADD CONSTRAINT "Borrow_bicycleId_fkey" FOREIGN KEY ("bicycleId") REFERENCES "Bicycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
