import { Injectable, Logger } from '@nestjs/common';
import { KuromojiService } from 'app/kuromoji/kuromoji.service';
import { processAndTrackWordsForUser } from './methods/processAndTrackWordsForUser';
import { PrismaService } from 'app/prisma/prisma.service';

@Injectable()
export class WordService {
  protected logger = new Logger(WordService.name);
  constructor(
    protected readonly kuromojiService: KuromojiService,
    protected readonly prismaService: PrismaService,
  ) {}

  processAndTrackWordsForUser = processAndTrackWordsForUser;
}
