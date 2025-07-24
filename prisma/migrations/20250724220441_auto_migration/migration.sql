/*
  Warnings:

  - You are about to drop the column `userSentenceId` on the `schedule_item_sentences` table. All the data in the column will be lost.
  - You are about to drop the `particles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_sentence_items` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[sentenceId]` on the table `schedule_item_sentences` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sentenceId` to the `schedule_item_sentences` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "particles" DROP CONSTRAINT "particles_languageId_fkey";

-- DropForeignKey
ALTER TABLE "schedule_item_sentences" DROP CONSTRAINT "schedule_item_sentences_userSentenceId_fkey";

-- DropForeignKey
ALTER TABLE "user_sentence_items" DROP CONSTRAINT "user_sentence_items_particleId_fkey";

-- DropForeignKey
ALTER TABLE "user_sentence_items" DROP CONSTRAINT "user_sentence_items_userSentenceId_fkey";

-- DropForeignKey
ALTER TABLE "user_sentence_items" DROP CONSTRAINT "user_sentence_items_userWordId_fkey";

-- DropIndex
DROP INDEX "schedule_item_sentences_userSentenceId_key";

-- AlterTable
ALTER TABLE "schedule_item_sentences" DROP COLUMN "userSentenceId",
ADD COLUMN     "sentenceId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "particles";

-- DropTable
DROP TABLE "user_sentence_items";

-- CreateTable
CREATE TABLE "sentence_word_occurrences" (
    "id" SERIAL NOT NULL,
    "sentenceId" INTEGER NOT NULL,
    "wordId" INTEGER NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sentence_word_occurrences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sentence_word_occurrences_sentenceId_idx" ON "sentence_word_occurrences"("sentenceId");

-- CreateIndex
CREATE INDEX "sentence_word_occurrences_wordId_idx" ON "sentence_word_occurrences"("wordId");

-- CreateIndex
CREATE UNIQUE INDEX "sentence_word_occurrences_sentenceId_orderIndex_key" ON "sentence_word_occurrences"("sentenceId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_item_sentences_sentenceId_key" ON "schedule_item_sentences"("sentenceId");

-- AddForeignKey
ALTER TABLE "schedule_item_sentences" ADD CONSTRAINT "schedule_item_sentences_sentenceId_fkey" FOREIGN KEY ("sentenceId") REFERENCES "user_sentences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sentence_word_occurrences" ADD CONSTRAINT "sentence_word_occurrences_sentenceId_fkey" FOREIGN KEY ("sentenceId") REFERENCES "user_sentences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sentence_word_occurrences" ADD CONSTRAINT "sentence_word_occurrences_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "words"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
