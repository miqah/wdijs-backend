import { Body, Controller, MessageEvent, Post, Sse } from '@nestjs/common';
import { TranslatorService } from './translator.service';
import { TranslationRequestDto } from './dtos/translation.dto';
import { User } from 'decorators/user.decorator';
import { User as UserType } from '@prisma/client';
import { Observable } from 'rxjs';

@Controller('/translator')
export class TranslatorController {
  constructor(private readonly translatorService: TranslatorService) {}

  @Post('/translate')
  @Sse()
  translate(
    @Body() translationRequestDto: TranslationRequestDto,
    @User() user: UserType,
  ): Observable<MessageEvent> {
    return this.translatorService.translate({
      translationRequestDto,
    });
  }
}
