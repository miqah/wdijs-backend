-- AlterTable
ALTER TABLE "user_bots" ADD COLUMN     "friendshipContext" TEXT,
ADD COLUMN     "friendshipLevel" INTEGER NOT NULL DEFAULT 1;
