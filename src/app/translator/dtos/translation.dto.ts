// translation.dto.ts
import { WordType } from '@prisma/client';
import {
  IsString,
  IsObject,
  IsNotEmpty,
  IsNumber,
  IsEnum,
} from 'class-validator';

enum AudioEncoding {
  LINEAR16 = 'LINEAR16',
  AMR_WB = 'AMR_WB',
}

export class AudioConfigDto {
  @IsEnum(AudioEncoding)
  @IsNotEmpty()
  encoding: AudioEncoding;

  @IsNumber()
  @IsNotEmpty()
  sampleRateHertz: number;

  @IsNumber()
  @IsNotEmpty()
  languageId: number;
}

export class TranslationRequestDto {
  @IsString()
  @IsNotEmpty()
  audio: string;

  @IsObject()
  @IsNotEmpty()
  config: AudioConfigDto;

  @IsString()
  @IsNotEmpty()
  userBotId: string;
}

export interface ProcessedWord {
  surface: string;
  wordId: number;
  senses: {
    partOfSpeech: WordType;
    glosses: string[];
  }[];
  isNewForUser?: boolean;
}

export interface UserResponseStreamChunk {
  type: 'userResponse';
  key: string;
  userResponse: string;
}

export interface BotTranslationStreamChunk {
  type: 'botChunk';
  key: string;
  botResponse: string;
  botResponseWords: ProcessedWord[];
}
