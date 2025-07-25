import { Injectable, Logger } from '@nestjs/common';
import { translate } from './methods/translate';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../gemini/gemini.service';
import { getTranslatorIntroduction } from './methods/getTranslatorIntroduction';
import { KuromojiService } from 'app/kuromoji/kuromoji.service';
import { WordService } from 'app/word/word.service';

@Injectable()
export class TranslatorService {
  protected readonly logger = new Logger(TranslatorService.name);
  constructor(
    protected readonly prismaService: PrismaService,
    protected readonly geminiService: GeminiService,
    protected readonly kuromojiService: KuromojiService,
    protected readonly wordService: WordService,
  ) {}

  translate = translate;
  getTranslatorIntroduction = getTranslatorIntroduction;
}
