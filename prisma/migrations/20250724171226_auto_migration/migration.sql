/*
  Warnings:

  - The `entSeq` column on the `words` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "words" DROP COLUMN "entSeq",
ADD COLUMN     "entSeq" INTEGER;
