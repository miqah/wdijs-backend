import { MessageEvent, NotFoundException } from '@nestjs/common';
import {
  BotTranslationStreamChunk,
  TranslationRequestDto,
  UserResponseStreamChunk,
} from '../dtos/translation.dto';
import { convertToWav } from 'utils/convertToWav';
import { Observable } from 'rxjs';
import { TranslatorService } from '../translator.service';
import { randomUUID } from 'crypto';
import * as FormData from 'form-data';
import axios, { AxiosResponse } from 'axios';
import { User } from '@prisma/client';

interface TranscriptionResponse {
  text: string;
}

export function translate(
  this: TranslatorService,
  {
    translationRequestDto,
    user,
  }: {
    translationRequestDto: TranslationRequestDto;
    user: User;
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
          const userChunk: UserResponseStreamChunk = {
            type: 'userResponse',
            key: responseMessageKey,
            userResponse: text,
          };
          subscriber.next({
            data: JSON.stringify(userChunk),
          });

          await streamTranslation.call(
            this,
            subscriber,
            text,
            userBot,
            language.name,
            translationMessageKey,
            user,
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
  user: User,
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

    const words = await this.wordService.processAndTrackWordsForUser(
      chunk,
      user.id,
    );

    const chunkPayload: BotTranslationStreamChunk = {
      type: 'botChunk',
      key,
      botResponse: chunk,
      botResponseWords: words,
    };

    subscriber.next({
      data: JSON.stringify(chunkPayload),
    });
  }

  this.logger.log(`Translation complete. Sent ${chunkCount} chunks.`);
}
