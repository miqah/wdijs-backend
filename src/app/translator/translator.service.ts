import { Injectable, Logger } from '@nestjs/common';
import { translate } from './methods/translate';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../gemini/gemini.service';
import { VoskService } from 'app/vosk/vosk.service';

@Injectable()
export class TranslatorService {
  protected readonly logger = new Logger(TranslatorService.name);
  constructor(
    protected readonly prismaService: PrismaService,
    protected readonly geminiService: GeminiService,
    protected readonly voskService: VoskService
  ) {}

  translate = translate;
}
