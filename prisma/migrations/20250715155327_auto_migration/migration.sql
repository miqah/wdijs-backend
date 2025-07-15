/*
  Warnings:

  - Added the required column `updatedAt` to the `kanji` table without a default value. This is not possible if the table is not empty.
  - Added the required column `meaning` to the `radicals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameRomaji` to the `radicals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `radicals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "kanji" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "examples" TEXT,
ADD COLUMN     "frequency" INTEGER,
ADD COLUMN     "grade" INTEGER,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "jlptLevel" INTEGER,
ADD COLUMN     "strokeOrder" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "radicals" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "meaning" TEXT NOT NULL,
ADD COLUMN     "nameRomaji" TEXT NOT NULL,
ADD COLUMN     "strokeCount" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "KanjiOnyomi" (
    "id" SERIAL NOT NULL,
    "reading" TEXT NOT NULL,
    "kanjiId" INTEGER NOT NULL,

    CONSTRAINT "KanjiOnyomi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanjiKunyomi" (
    "id" SERIAL NOT NULL,
    "reading" TEXT NOT NULL,
    "kanjiId" INTEGER NOT NULL,

    CONSTRAINT "KanjiKunyomi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanjiNanori" (
    "id" SERIAL NOT NULL,
    "reading" TEXT NOT NULL,
    "kanjiId" INTEGER NOT NULL,

    CONSTRAINT "KanjiNanori_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KanjiOnyomi_kanjiId_reading_key" ON "KanjiOnyomi"("kanjiId", "reading");

-- CreateIndex
CREATE UNIQUE INDEX "KanjiKunyomi_kanjiId_reading_key" ON "KanjiKunyomi"("kanjiId", "reading");

-- CreateIndex
CREATE UNIQUE INDEX "KanjiNanori_kanjiId_reading_key" ON "KanjiNanori"("kanjiId", "reading");

-- AddForeignKey
ALTER TABLE "KanjiOnyomi" ADD CONSTRAINT "KanjiOnyomi_kanjiId_fkey" FOREIGN KEY ("kanjiId") REFERENCES "kanji"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjiKunyomi" ADD CONSTRAINT "KanjiKunyomi_kanjiId_fkey" FOREIGN KEY ("kanjiId") REFERENCES "kanji"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjiNanori" ADD CONSTRAINT "KanjiNanori_kanjiId_fkey" FOREIGN KEY ("kanjiId") REFERENCES "kanji"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
