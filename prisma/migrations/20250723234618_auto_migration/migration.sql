/*
  Warnings:

  - A unique constraint covering the columns `[symbol]` on the table `radicals` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `symbol` to the `radicals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "radicals" ADD COLUMN     "classification" INTEGER,
ADD COLUMN     "frequency" INTEGER,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "symbol" TEXT NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "nameRomaji" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "radicals_symbol_key" ON "radicals"("symbol");
