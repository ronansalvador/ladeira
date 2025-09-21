/*
  Warnings:

  - You are about to drop the column `produto` on the `Consumo` table. All the data in the column will be lost.
  - You are about to drop the column `valorUnit` on the `Consumo` table. All the data in the column will be lost.
  - Added the required column `produtoId` to the `Consumo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Consumo" DROP COLUMN "produto",
DROP COLUMN "valorUnit",
ADD COLUMN     "produtoId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."Produto" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Consumo" ADD CONSTRAINT "Consumo_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "public"."Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
