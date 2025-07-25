/*
  Warnings:

  - A unique constraint covering the columns `[firebaseUid]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `learningStageId` to the `user_sentences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firebaseUid` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_sentences" ADD COLUMN     "learningStageId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "firebaseUid" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "user_sentences_learningStageId_idx" ON "user_sentences"("learningStageId");

-- CreateIndex
CREATE UNIQUE INDEX "users_firebaseUid_key" ON "users"("firebaseUid");

-- AddForeignKey
ALTER TABLE "user_sentences" ADD CONSTRAINT "user_sentences_learningStageId_fkey" FOREIGN KEY ("learningStageId") REFERENCES "learning_stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
