import { MessageEvent, NotFoundException } from '@nestjs/common';
import { TranslationRequestDto } from '../dtos/translation.dto';
import { convertToWav } from 'utils/convertToWav';
import { Observable } from 'rxjs';
import { TranslatorService } from '../translator.service';
import { randomUUID } from 'crypto';
import * as FormData from 'form-data';
import axios, { AxiosResponse } from 'axios';

interface TranscriptionResponse {
  text: string;
}

export function translate(
  this: TranslatorService,
  {
    translationRequestDto,
  }: {
    translationRequestDto: TranslationRequestDto;
  },
): Observable<MessageEvent> {
  this.logger.log('Starting streaming translation process');

  return new Observable<MessageEvent>((subscriber) => {
    (async () => {
      try {
        const { config, audio, userBotId } = translationRequestDto;
        const { languageId } = config;

        const { userBot, language } = await fetchUserBotAndLanguage.call(
          this,
          userBotId,
          languageId,
        );

        if (!audio) throw new NotFoundException('Missing input audio');

        const wavBuffer = await decodeAndConvertAudio(audio);
        const text = await transcribeAudio(wavBuffer);

        const responseMessageKey = randomUUID();
        const translationMessageKey = randomUUID();

        if (text) {
          subscriber.next({
            data: JSON.stringify({ response: text, key: responseMessageKey }),
          });

          await streamTranslation.call(
            this,
            subscriber,
            text,
            userBot,
            language.name,
            translationMessageKey,
          );
        }

        subscriber.complete();
      } catch (error) {
        this.logger.error('Error in streaming translation process', error);
        if (error instanceof Error) {
          this.logger.error(`Error message: ${error.message}`);
          this.logger.error(`Error stack: ${error.stack}`);
        }
        subscriber.error(error);
      }
    })();
  });
}

async function fetchUserBotAndLanguage(
  this: TranslatorService,
  userBotId: string,
  languageId: number,
) {
  const userBot = await this.prismaService.userBot.findFirst({
    where: { id: Number(userBotId) },
    include: { bot: true },
  });

  const language = await this.prismaService.language.findFirst({
    where: { id: languageId },
  });

  if (!language) {
    throw new NotFoundException(`Language with id ${languageId} not found`);
  }

  return { userBot, language };
}

async function decodeAndConvertAudio(base64Audio: string): Promise<Buffer> {
  const m4aBuffer = Buffer.from(base64Audio, 'base64');
  return await convertToWav(m4aBuffer);
}

async function transcribeAudio(wavBuffer: Buffer): Promise<string> {
  const form = new FormData();
  form.append('file', wavBuffer, {
    filename: 'audio.wav',
    contentType: 'audio/wav',
  });

  const response: AxiosResponse<TranscriptionResponse> = await axios.post(
    `${process.env.WHISPER_BASE_URL}/transcribe`,
    form,
    { headers: form.getHeaders() },
  );

  return response.data.text;
}

async function streamTranslation(
  this: TranslatorService,
  subscriber: any,
  text: string,
  userBot: any,
  language: string,
  key: string,
): Promise<void> {
  let chunkCount = 0;

  for await (const chunk of this.geminiService.translateWithContext({
    text,
    targetLang: language,
    userContext: userBot?.context,
    baseContext: userBot?.bot.basePrompt,
  })) {
    chunkCount++;
    this.logger.log(
      `Sending translation chunk #${chunkCount}: "${chunk.slice(0, 50)}${chunk.length > 50 ? '...' : ''}"`,
    );

    const tokens = this.kuromojiService.tokenize(chunk);
    const foundWords: any[] = [];

    for (const token of tokens) {
      const surface = token.surface_form;
      const reading = token.reading; // This will be in katakana

      // Check if the token contains kanji
      const containsKanji = /[\u4e00-\u9faf]/.test(surface);

      // Determine if we should search in writings or readings
      let word;

      if (containsKanji) {
        // If the surface form contains kanji, look it up in writings
        word = await this.prismaService.word.findFirst({
          where: {
            writings: {
              some: {
                text: surface,
              },
            },
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
      } else {
        // If it's all kana, look it up in readings
        word = await this.prismaService.word.findFirst({
          where: {
            readings: {
              some: {
                value: surface,
              },
            },
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
      }

      if (word) {
        foundWords.push({
          surface,
          wordId: word.id,
          senses: word.senses.map((sense) => ({
            partOfSpeech: sense.partOfSpeech,
            glosses: sense.englishGlosses.map((g) => g.text),
          })),
        });
      }
    }
    console.log(JSON.stringify(foundWords, null, 2));

    subscriber.next({
      data: JSON.stringify({
        transcription: chunk,
        key,
      }),
    });
  }

  this.logger.log(`Translation complete. Sent ${chunkCount} chunks.`);
}
