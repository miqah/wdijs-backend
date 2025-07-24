/*
  Warnings:

  - You are about to drop the `_KanjiWords` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_KanjiWords" DROP CONSTRAINT "_KanjiWords_A_fkey";

-- DropForeignKey
ALTER TABLE "_KanjiWords" DROP CONSTRAINT "_KanjiWords_B_fkey";

-- DropTable
DROP TABLE "_KanjiWords";

-- CreateTable
CREATE TABLE "kanji_in_writings" (
    "id" SERIAL NOT NULL,
    "writingId" INTEGER NOT NULL,
    "kanjiId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "kanji_in_writings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "kanji_in_writings_kanjiId_idx" ON "kanji_in_writings"("kanjiId");

-- CreateIndex
CREATE UNIQUE INDEX "kanji_in_writings_writingId_position_key" ON "kanji_in_writings"("writingId", "position");

-- AddForeignKey
ALTER TABLE "kanji_in_writings" ADD CONSTRAINT "kanji_in_writings_writingId_fkey" FOREIGN KEY ("writingId") REFERENCES "word_writings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanji_in_writings" ADD CONSTRAINT "kanji_in_writings_kanjiId_fkey" FOREIGN KEY ("kanjiId") REFERENCES "Kanji"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
