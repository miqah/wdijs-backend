-- CreateTable
CREATE TABLE "kanji" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "kanji_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radicals" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "radicals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_KanjiRadicals" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_KanjiRadicals_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_KanjiWords" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_KanjiWords_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_KanjiRadicals_B_index" ON "_KanjiRadicals"("B");

-- CreateIndex
CREATE INDEX "_KanjiWords_B_index" ON "_KanjiWords"("B");

-- AddForeignKey
ALTER TABLE "_KanjiRadicals" ADD CONSTRAINT "_KanjiRadicals_A_fkey" FOREIGN KEY ("A") REFERENCES "kanji"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KanjiRadicals" ADD CONSTRAINT "_KanjiRadicals_B_fkey" FOREIGN KEY ("B") REFERENCES "radicals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KanjiWords" ADD CONSTRAINT "_KanjiWords_A_fkey" FOREIGN KEY ("A") REFERENCES "kanji"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KanjiWords" ADD CONSTRAINT "_KanjiWords_B_fkey" FOREIGN KEY ("B") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE CASCADE;
