/*
  Warnings:

  - You are about to drop the column `strokeOrder` on the `kanji` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "kanji" DROP COLUMN "strokeOrder",
ADD COLUMN     "strokeCount" INTEGER;
