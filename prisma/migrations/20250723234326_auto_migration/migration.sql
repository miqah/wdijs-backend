/*
  Warnings:

  - The values [NOUN,VERB,ADJECTIVE,ADVERB,CONJUNCTION,INTERJECTION,PRONOUN] on the enum `WordType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `wordOrder` on the `user_sentences` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `words` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `words` table. All the data in the column will be lost.
  - You are about to drop the `kanji` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "WordType_new" AS ENUM ('N', 'PN', 'AN', 'V1', 'V5U', 'VS', 'ADJ_I', 'ADJ_NA', 'ADV', 'CONJ', 'INTERJ', 'PRON', 'SUFFIX', 'PREFIX', 'EXP');
ALTER TABLE "words" ALTER COLUMN "type" TYPE "WordType_new" USING ("type"::text::"WordType_new");
ALTER TYPE "WordType" RENAME TO "WordType_old";
ALTER TYPE "WordType_new" RENAME TO "WordType";
DROP TYPE "WordType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "KanjiKunyomi" DROP CONSTRAINT "KanjiKunyomi_kanjiId_fkey";

-- DropForeignKey
ALTER TABLE "KanjiNanori" DROP CONSTRAINT "KanjiNanori_kanjiId_fkey";

-- DropForeignKey
ALTER TABLE "KanjiOnyomi" DROP CONSTRAINT "KanjiOnyomi_kanjiId_fkey";

-- DropForeignKey
ALTER TABLE "_KanjiRadicals" DROP CONSTRAINT "_KanjiRadicals_A_fkey";

-- DropForeignKey
ALTER TABLE "_KanjiWords" DROP CONSTRAINT "_KanjiWords_A_fkey";

-- AlterTable
ALTER TABLE "user_sentences" DROP COLUMN "wordOrder";

-- AlterTable
ALTER TABLE "words" DROP COLUMN "description",
DROP COLUMN "name";

-- DropTable
DROP TABLE "kanji";

-- CreateTable
CREATE TABLE "user_sentence_items" (
    "id" SERIAL NOT NULL,
    "userSentenceId" INTEGER NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "userWordId" INTEGER,
    "particleId" INTEGER,

    CONSTRAINT "user_sentence_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "word_writings" (
    "id" SERIAL NOT NULL,
    "wordId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "isKana" BOOLEAN NOT NULL,

    CONSTRAINT "word_writings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "word_senses" (
    "id" SERIAL NOT NULL,
    "wordId" INTEGER NOT NULL,
    "meaning" TEXT NOT NULL,
    "tags" TEXT,

    CONSTRAINT "word_senses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kanji" (
    "id" SERIAL NOT NULL,
    "character" TEXT NOT NULL,
    "strokeCount" INTEGER,
    "grade" INTEGER,
    "frequency" INTEGER,
    "jlptLevel" INTEGER,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kanji_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_sentence_items_userSentenceId_orderIndex_key" ON "user_sentence_items"("userSentenceId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "word_writings_wordId_text_key" ON "word_writings"("wordId", "text");

-- CreateIndex
CREATE UNIQUE INDEX "Kanji_character_key" ON "Kanji"("character");

-- AddForeignKey
ALTER TABLE "user_sentence_items" ADD CONSTRAINT "user_sentence_items_userSentenceId_fkey" FOREIGN KEY ("userSentenceId") REFERENCES "user_sentences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sentence_items" ADD CONSTRAINT "user_sentence_items_userWordId_fkey" FOREIGN KEY ("userWordId") REFERENCES "user_words"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sentence_items" ADD CONSTRAINT "user_sentence_items_particleId_fkey" FOREIGN KEY ("particleId") REFERENCES "particles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "word_writings" ADD CONSTRAINT "word_writings_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "words"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "word_senses" ADD CONSTRAINT "word_senses_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "words"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjiOnyomi" ADD CONSTRAINT "KanjiOnyomi_kanjiId_fkey" FOREIGN KEY ("kanjiId") REFERENCES "Kanji"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjiKunyomi" ADD CONSTRAINT "KanjiKunyomi_kanjiId_fkey" FOREIGN KEY ("kanjiId") REFERENCES "Kanji"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjiNanori" ADD CONSTRAINT "KanjiNanori_kanjiId_fkey" FOREIGN KEY ("kanjiId") REFERENCES "Kanji"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KanjiRadicals" ADD CONSTRAINT "_KanjiRadicals_A_fkey" FOREIGN KEY ("A") REFERENCES "Kanji"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KanjiWords" ADD CONSTRAINT "_KanjiWords_A_fkey" FOREIGN KEY ("A") REFERENCES "Kanji"("id") ON DELETE CASCADE ON UPDATE CASCADE;
