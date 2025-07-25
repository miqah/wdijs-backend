import { ProcessedWord } from 'app/translator/dtos/translation.dto';
import { mapKuromojiPosToWordType } from '../utils/mapKuromojiPosToWordType';
import { WordService } from '../word.service';

export async function processAndTrackWordsForUser(
  this: WordService,
  text: string,
  userId: number,
): Promise<ProcessedWord[]> {
  this.logger.log(`Starting processAndTrackWordsForUser for userId=${userId}`);

  const tokens = this.kuromojiService.tokenize(text);
  const foundWords: ProcessedWord[] = [];

  this.logger.log(`Tokenized text: "${text}", token count: ${tokens.length}`);

  for (const token of tokens) {
    // Skip punctuation and certain particles
    if (
      token.pos === '記号' ||
      (token.pos === '助詞' && token.surface_form.length === 1)
    ) {
      this.logger.debug(
        `Skipping token "${token.surface_form}" with POS "${token.pos}"`,
      );
      continue;
    }

    const surface = token.surface_form;
    const tokenPos = mapKuromojiPosToWordType(token);
    const containsKanji = /[\u4e00-\u9faf]/.test(surface);

    this.logger.debug(
      `Processing token: surface="${surface}", POS="${tokenPos}", containsKanji=${containsKanji}`,
    );

    let word;

    if (containsKanji) {
      word = await this.prismaService.word.findFirst({
        where: {
          writings: {
            some: {
              text: surface,
            },
          },
          ...(tokenPos && {
            senses: {
              some: {
                partOfSpeech: tokenPos,
              },
            },
          }),
        },
        include: {
          writings: true,
          senses: {
            include: {
              englishGlosses: true,
            },
          },
        },
      });
      this.logger.debug(
        word
          ? `Found word (kanji) for "${surface}" with id=${word.id}`
          : `No word (kanji) found for "${surface}"`,
      );
    } else {
      word = await this.prismaService.word.findFirst({
        where: {
          readings: {
            some: {
              value: surface,
            },
          },
          ...(tokenPos && {
            senses: {
              some: {
                partOfSpeech: tokenPos,
              },
            },
          }),
        },
        include: {
          readings: true,
          senses: {
            include: {
              englishGlosses: true,
            },
          },
        },
      });
      this.logger.debug(
        word
          ? `Found word (kana) for "${surface}" with id=${word.id}`
          : `No word (kana) found for "${surface}"`,
      );
    }

    if (word) {
      const existingUserWord = await this.prismaService.userWord.findFirst({
        where: {
          userId,
          wordId: word.id,
        },
      });

      let isNewForUser = false;

      if (!existingUserWord) {
        isNewForUser = true;

        const firstLearningStage =
          await this.prismaService.learningStage.findFirst({
            orderBy: { id: 'asc' },
          });

        if (!firstLearningStage) {
          this.logger.error('No learning stages found in the database');
          throw new Error('No learning stages found in the database');
        }

        await this.prismaService.userWord.create({
          data: {
            userId,
            wordId: word.id,
            learningStageId: firstLearningStage.id,
          },
        });

        this.logger.log(
          `Created UserWord: userId=${userId}, wordId=${word.id}, learningStageId=${firstLearningStage.id}`,
        );
      } else {
        this.logger.debug(`User already associated with wordId=${word.id}`);
      }

      foundWords.push({
        surface,
        wordId: word.id,
        senses: word.senses.map((sense) => ({
          partOfSpeech: sense.partOfSpeech,
          glosses: sense.englishGlosses.map((g) => g.text),
        })),
        isNewForUser,
      });
    }
  }

  this.logger.log(
    `processAndTrackWordsForUser finished. Processed ${foundWords.length} words for userId=${userId}`,
  );

  return foundWords;
}
