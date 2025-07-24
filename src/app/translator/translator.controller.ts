import {
  Body,
  Controller,
  Get,
  MessageEvent,
  Param,
  Post,
  Sse,
} from '@nestjs/common';
import { TranslatorService } from './translator.service';
import { TranslationRequestDto } from './dtos/translation.dto';
import { Observable } from 'rxjs';

@Controller('/translator')
export class TranslatorController {
  constructor(private readonly translatorService: TranslatorService) {}

  @Post('/translate')
  @Sse()
  translate(
    @Body() translationRequestDto: TranslationRequestDto,
  ): Observable<MessageEvent> {
    return this.translatorService.translate({
      translationRequestDto,
    });
  }

  @Sse(':userBotId/introduction')
  getTranslatorIntroduction(
    @Param('userBotId') userBotId: string,
  ): Observable<MessageEvent> {
    return this.translatorService.getTranslatorIntroduction({ userBotId });
  }
}
