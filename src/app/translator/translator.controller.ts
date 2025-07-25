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
import { UserRequest } from 'decorators/user.decorator';
import { User } from '@prisma/client';

@Controller('/translator')
export class TranslatorController {
  constructor(private readonly translatorService: TranslatorService) {}

  @Post('/translate')
  @Sse()
  translate(
    @Body() translationRequestDto: TranslationRequestDto,
    @UserRequest() user: User,
  ): Observable<MessageEvent> {
    return this.translatorService.translate({
      translationRequestDto,
      user,
    });
  }

  @Sse(':userBotId/introduction')
  getTranslatorIntroduction(
    @Param('userBotId') userBotId: string,
  ): Observable<MessageEvent> {
    return this.translatorService.getTranslatorIntroduction({ userBotId });
  }
}
