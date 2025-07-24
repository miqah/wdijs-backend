/*
  Warnings:

  - You are about to drop the column `nextReview` on the `user_words` table. All the data in the column will be lost.
  - You are about to drop the column `repetitionCount` on the `user_words` table. All the data in the column will be lost.
  - You are about to drop the column `reviewedAt` on the `user_words` table. All the data in the column will be lost.
  - You are about to drop the `user_schedules` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PracticeType" AS ENUM ('WORD', 'SENTENCE', 'CONVERSATION');

-- DropForeignKey
ALTER TABLE "user_schedules" DROP CONSTRAINT "user_schedules_userId_fkey";

-- AlterTable
ALTER TABLE "user_words" DROP COLUMN "nextReview",
DROP COLUMN "repetitionCount",
DROP COLUMN "reviewedAt";

-- DropTable
DROP TABLE "user_schedules";

-- CreateTable
CREATE TABLE "schedule_items" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "PracticeType" NOT NULL,
    "nextReview" TIMESTAMP(3) NOT NULL,
    "repetition" INTEGER NOT NULL,
    "easeFactor" DOUBLE PRECISION NOT NULL,
    "lastReviewed" TIMESTAMP(3),

    CONSTRAINT "schedule_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleItemWord" (
    "id" SERIAL NOT NULL,
    "scheduleItemId" INTEGER NOT NULL,
    "userWordId" INTEGER NOT NULL,

    CONSTRAINT "ScheduleItemWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleItemSentence" (
    "id" SERIAL NOT NULL,
    "scheduleItemId" INTEGER NOT NULL,
    "userSentenceId" INTEGER NOT NULL,

    CONSTRAINT "ScheduleItemSentence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleItemBot" (
    "id" SERIAL NOT NULL,
    "scheduleItemId" INTEGER NOT NULL,
    "userBotId" INTEGER NOT NULL,

    CONSTRAINT "ScheduleItemBot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleItemWord_scheduleItemId_key" ON "ScheduleItemWord"("scheduleItemId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleItemWord_userWordId_key" ON "ScheduleItemWord"("userWordId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleItemSentence_scheduleItemId_key" ON "ScheduleItemSentence"("scheduleItemId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleItemSentence_userSentenceId_key" ON "ScheduleItemSentence"("userSentenceId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleItemBot_scheduleItemId_key" ON "ScheduleItemBot"("scheduleItemId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleItemBot_userBotId_key" ON "ScheduleItemBot"("userBotId");

-- AddForeignKey
ALTER TABLE "schedule_items" ADD CONSTRAINT "schedule_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleItemWord" ADD CONSTRAINT "ScheduleItemWord_scheduleItemId_fkey" FOREIGN KEY ("scheduleItemId") REFERENCES "schedule_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleItemWord" ADD CONSTRAINT "ScheduleItemWord_userWordId_fkey" FOREIGN KEY ("userWordId") REFERENCES "user_words"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleItemSentence" ADD CONSTRAINT "ScheduleItemSentence_scheduleItemId_fkey" FOREIGN KEY ("scheduleItemId") REFERENCES "schedule_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleItemSentence" ADD CONSTRAINT "ScheduleItemSentence_userSentenceId_fkey" FOREIGN KEY ("userSentenceId") REFERENCES "user_sentences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleItemBot" ADD CONSTRAINT "ScheduleItemBot_scheduleItemId_fkey" FOREIGN KEY ("scheduleItemId") REFERENCES "schedule_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleItemBot" ADD CONSTRAINT "ScheduleItemBot_userBotId_fkey" FOREIGN KEY ("userBotId") REFERENCES "user_bots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
