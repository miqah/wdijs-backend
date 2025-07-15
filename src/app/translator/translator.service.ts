import { Injectable } from '@nestjs/common';
import { translate } from './methods/translate';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../gemini/gemini.service';

@Injectable()
export class TranslatorService {
  constructor(
    protected readonly prismaService: PrismaService,
    protected readonly geminiService: GeminiService,
  ) {}

  translate = translate;
}
