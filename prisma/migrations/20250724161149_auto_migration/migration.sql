-- CreateEnum
CREATE TYPE "WordType" AS ENUM ('N', 'N_ADV', 'N_T', 'N_PREF', 'N_SUF', 'PN', 'V1', 'V5B', 'V5G', 'V5K', 'V5M', 'V5N', 'V5R', 'V5S', 'V5T', 'V5U', 'V5K_S', 'VS', 'VS_S', 'VS_I', 'VK', 'VZ', 'VI', 'VT', 'ADJ_I', 'ADJ_NA', 'ADJ_NO', 'ADJ_PN', 'ADJ_T', 'ADJ_F', 'ADV', 'ADV_TO', 'AUX', 'AUX_V', 'AUX_ADJ', 'CONJ', 'COOR', 'CTR', 'EXP', 'INT', 'INTERJ', 'PRT', 'PREF', 'SUFFIX', 'PROV', 'X');

-- CreateEnum
CREATE TYPE "PracticeType" AS ENUM ('WORD', 'SENTENCE', 'CONVERSATION');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "schedule_item_words" (
    "id" SERIAL NOT NULL,
    "scheduleItemId" INTEGER NOT NULL,
    "userWordId" INTEGER NOT NULL,

    CONSTRAINT "schedule_item_words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_item_sentences" (
    "id" SERIAL NOT NULL,
    "scheduleItemId" INTEGER NOT NULL,
    "userSentenceId" INTEGER NOT NULL,

    CONSTRAINT "schedule_item_sentences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_item_bots" (
    "id" SERIAL NOT NULL,
    "scheduleItemId" INTEGER NOT NULL,
    "userBotId" INTEGER NOT NULL,

    CONSTRAINT "schedule_item_bots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bots" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "basePrompt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_bots" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "botId" INTEGER NOT NULL,
    "nickname" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "friendshipLevel" INTEGER NOT NULL DEFAULT 1,
    "friendshipContext" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_bots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_stages" (
    "id" SERIAL NOT NULL,
    "stageName" TEXT NOT NULL,
    "description" TEXT,
    "stayDuration" INTEGER NOT NULL,
    "interval" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_levels" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "languageId" INTEGER NOT NULL,
    "ranking" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_words" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "wordId" INTEGER NOT NULL,
    "learningStageId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sentences" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sentences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sentence_items" (
    "id" SERIAL NOT NULL,
    "userSentenceId" INTEGER NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "userWordId" INTEGER,
    "particleId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sentence_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "languages" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "words" (
    "id" SERIAL NOT NULL,
    "languageId" INTEGER NOT NULL,
    "testLevelId" INTEGER,
    "isCommon" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER,
    "entSeq" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "word_readings" (
    "id" SERIAL NOT NULL,
    "wordId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "word_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "word_writings" (
    "id" SERIAL NOT NULL,
    "wordId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "isKana" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "word_writings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "word_senses" (
    "id" SERIAL NOT NULL,
    "wordId" INTEGER NOT NULL,
    "partOfSpeech" "WordType" NOT NULL,
    "originalPosTag" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "word_senses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "english_glosses" (
    "id" SERIAL NOT NULL,
    "wordSenseId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "english_glosses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "particles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "languageId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "particles_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "kanji_onyomi" (
    "id" SERIAL NOT NULL,
    "reading" TEXT NOT NULL,
    "kanjiId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kanji_onyomi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanji_kunyomi" (
    "id" SERIAL NOT NULL,
    "reading" TEXT NOT NULL,
    "kanjiId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kanji_kunyomi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanji_nanori" (
    "id" SERIAL NOT NULL,
    "reading" TEXT NOT NULL,
    "kanjiId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kanji_nanori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radicals" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameRomaji" TEXT,
    "meaning" TEXT NOT NULL,
    "strokeCount" INTEGER,
    "position" TEXT,
    "imageUrl" TEXT,
    "description" TEXT,
    "classification" INTEGER,
    "frequency" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

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
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "schedule_items_userId_idx" ON "schedule_items"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_item_words_scheduleItemId_key" ON "schedule_item_words"("scheduleItemId");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_item_words_userWordId_key" ON "schedule_item_words"("userWordId");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_item_sentences_scheduleItemId_key" ON "schedule_item_sentences"("scheduleItemId");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_item_sentences_userSentenceId_key" ON "schedule_item_sentences"("userSentenceId");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_item_bots_scheduleItemId_key" ON "schedule_item_bots"("scheduleItemId");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_item_bots_userBotId_key" ON "schedule_item_bots"("userBotId");

-- CreateIndex
CREATE INDEX "user_bots_userId_idx" ON "user_bots"("userId");

-- CreateIndex
CREATE INDEX "user_bots_botId_idx" ON "user_bots"("botId");

-- CreateIndex
CREATE UNIQUE INDEX "learning_stages_stageName_key" ON "learning_stages"("stageName");

-- CreateIndex
CREATE INDEX "test_levels_languageId_idx" ON "test_levels"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "test_levels_name_languageId_key" ON "test_levels"("name", "languageId");

-- CreateIndex
CREATE INDEX "user_words_userId_idx" ON "user_words"("userId");

-- CreateIndex
CREATE INDEX "user_words_wordId_idx" ON "user_words"("wordId");

-- CreateIndex
CREATE INDEX "user_words_learningStageId_idx" ON "user_words"("learningStageId");

-- CreateIndex
CREATE INDEX "user_sentences_userId_idx" ON "user_sentences"("userId");

-- CreateIndex
CREATE INDEX "user_sentence_items_userSentenceId_idx" ON "user_sentence_items"("userSentenceId");

-- CreateIndex
CREATE INDEX "user_sentence_items_userWordId_idx" ON "user_sentence_items"("userWordId");

-- CreateIndex
CREATE INDEX "user_sentence_items_particleId_idx" ON "user_sentence_items"("particleId");

-- CreateIndex
CREATE UNIQUE INDEX "user_sentence_items_userSentenceId_orderIndex_key" ON "user_sentence_items"("userSentenceId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "languages_name_key" ON "languages"("name");

-- CreateIndex
CREATE INDEX "words_languageId_idx" ON "words"("languageId");

-- CreateIndex
CREATE INDEX "words_testLevelId_idx" ON "words"("testLevelId");

-- CreateIndex
CREATE INDEX "words_isCommon_idx" ON "words"("isCommon");

-- CreateIndex
CREATE INDEX "word_readings_wordId_idx" ON "word_readings"("wordId");

-- CreateIndex
CREATE INDEX "word_readings_value_idx" ON "word_readings"("value");

-- CreateIndex
CREATE INDEX "word_writings_wordId_idx" ON "word_writings"("wordId");

-- CreateIndex
CREATE INDEX "word_writings_text_idx" ON "word_writings"("text");

-- CreateIndex
CREATE UNIQUE INDEX "word_writings_wordId_text_key" ON "word_writings"("wordId", "text");

-- CreateIndex
CREATE INDEX "word_senses_wordId_idx" ON "word_senses"("wordId");

-- CreateIndex
CREATE INDEX "word_senses_partOfSpeech_idx" ON "word_senses"("partOfSpeech");

-- CreateIndex
CREATE INDEX "english_glosses_wordSenseId_idx" ON "english_glosses"("wordSenseId");

-- CreateIndex
CREATE INDEX "english_glosses_text_idx" ON "english_glosses"("text");

-- CreateIndex
CREATE INDEX "particles_languageId_idx" ON "particles"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "particles_name_languageId_key" ON "particles"("name", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Kanji_character_key" ON "Kanji"("character");

-- CreateIndex
CREATE INDEX "Kanji_jlptLevel_idx" ON "Kanji"("jlptLevel");

-- CreateIndex
CREATE INDEX "Kanji_grade_idx" ON "Kanji"("grade");

-- CreateIndex
CREATE INDEX "kanji_onyomi_kanjiId_idx" ON "kanji_onyomi"("kanjiId");

-- CreateIndex
CREATE UNIQUE INDEX "kanji_onyomi_kanjiId_reading_key" ON "kanji_onyomi"("kanjiId", "reading");

-- CreateIndex
CREATE INDEX "kanji_kunyomi_kanjiId_idx" ON "kanji_kunyomi"("kanjiId");

-- CreateIndex
CREATE UNIQUE INDEX "kanji_kunyomi_kanjiId_reading_key" ON "kanji_kunyomi"("kanjiId", "reading");

-- CreateIndex
CREATE INDEX "kanji_nanori_kanjiId_idx" ON "kanji_nanori"("kanjiId");

-- CreateIndex
CREATE UNIQUE INDEX "kanji_nanori_kanjiId_reading_key" ON "kanji_nanori"("kanjiId", "reading");

-- CreateIndex
CREATE INDEX "radicals_strokeCount_idx" ON "radicals"("strokeCount");

-- CreateIndex
CREATE UNIQUE INDEX "radicals_symbol_key" ON "radicals"("symbol");

-- CreateIndex
CREATE INDEX "_KanjiRadicals_B_index" ON "_KanjiRadicals"("B");

-- CreateIndex
CREATE INDEX "_KanjiWords_B_index" ON "_KanjiWords"("B");

-- AddForeignKey
ALTER TABLE "schedule_items" ADD CONSTRAINT "schedule_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_item_words" ADD CONSTRAINT "schedule_item_words_scheduleItemId_fkey" FOREIGN KEY ("scheduleItemId") REFERENCES "schedule_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_item_words" ADD CONSTRAINT "schedule_item_words_userWordId_fkey" FOREIGN KEY ("userWordId") REFERENCES "user_words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_item_sentences" ADD CONSTRAINT "schedule_item_sentences_scheduleItemId_fkey" FOREIGN KEY ("scheduleItemId") REFERENCES "schedule_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_item_sentences" ADD CONSTRAINT "schedule_item_sentences_userSentenceId_fkey" FOREIGN KEY ("userSentenceId") REFERENCES "user_sentences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_item_bots" ADD CONSTRAINT "schedule_item_bots_scheduleItemId_fkey" FOREIGN KEY ("scheduleItemId") REFERENCES "schedule_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_item_bots" ADD CONSTRAINT "schedule_item_bots_userBotId_fkey" FOREIGN KEY ("userBotId") REFERENCES "user_bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_bots" ADD CONSTRAINT "user_bots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_bots" ADD CONSTRAINT "user_bots_botId_fkey" FOREIGN KEY ("botId") REFERENCES "bots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_levels" ADD CONSTRAINT "test_levels_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_words" ADD CONSTRAINT "user_words_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_words" ADD CONSTRAINT "user_words_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "words"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_words" ADD CONSTRAINT "user_words_learningStageId_fkey" FOREIGN KEY ("learningStageId") REFERENCES "learning_stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sentences" ADD CONSTRAINT "user_sentences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sentence_items" ADD CONSTRAINT "user_sentence_items_userSentenceId_fkey" FOREIGN KEY ("userSentenceId") REFERENCES "user_sentences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sentence_items" ADD CONSTRAINT "user_sentence_items_userWordId_fkey" FOREIGN KEY ("userWordId") REFERENCES "user_words"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sentence_items" ADD CONSTRAINT "user_sentence_items_particleId_fkey" FOREIGN KEY ("particleId") REFERENCES "particles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "words" ADD CONSTRAINT "words_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "words" ADD CONSTRAINT "words_testLevelId_fkey" FOREIGN KEY ("testLevelId") REFERENCES "test_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "word_readings" ADD CONSTRAINT "word_readings_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "word_writings" ADD CONSTRAINT "word_writings_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "word_senses" ADD CONSTRAINT "word_senses_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "english_glosses" ADD CONSTRAINT "english_glosses_wordSenseId_fkey" FOREIGN KEY ("wordSenseId") REFERENCES "word_senses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "particles" ADD CONSTRAINT "particles_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanji_onyomi" ADD CONSTRAINT "kanji_onyomi_kanjiId_fkey" FOREIGN KEY ("kanjiId") REFERENCES "Kanji"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanji_kunyomi" ADD CONSTRAINT "kanji_kunyomi_kanjiId_fkey" FOREIGN KEY ("kanjiId") REFERENCES "Kanji"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanji_nanori" ADD CONSTRAINT "kanji_nanori_kanjiId_fkey" FOREIGN KEY ("kanjiId") REFERENCES "Kanji"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KanjiRadicals" ADD CONSTRAINT "_KanjiRadicals_A_fkey" FOREIGN KEY ("A") REFERENCES "Kanji"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KanjiRadicals" ADD CONSTRAINT "_KanjiRadicals_B_fkey" FOREIGN KEY ("B") REFERENCES "radicals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KanjiWords" ADD CONSTRAINT "_KanjiWords_A_fkey" FOREIGN KEY ("A") REFERENCES "Kanji"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KanjiWords" ADD CONSTRAINT "_KanjiWords_B_fkey" FOREIGN KEY ("B") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE CASCADE;
