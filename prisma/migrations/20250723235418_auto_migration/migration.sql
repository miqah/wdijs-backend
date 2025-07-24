-- CreateTable
CREATE TABLE "WordReading" (
    "id" SERIAL NOT NULL,
    "wordId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "WordReading_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WordReading" ADD CONSTRAINT "WordReading_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "words"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
