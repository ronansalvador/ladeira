/*
  Warnings:

  - Added the required column `baileId` to the `Comanda` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Comanda" ADD COLUMN     "baileId" INTEGER NOT NULL,
ADD COLUMN     "closedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."Baile" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Baile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Comanda" ADD CONSTRAINT "Comanda_baileId_fkey" FOREIGN KEY ("baileId") REFERENCES "public"."Baile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
