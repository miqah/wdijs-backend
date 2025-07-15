import { Body, Controller, Param, Post } from '@nestjs/common';
import { TranslatorService } from './translator.service';

@Controller('/translator')
export class TranslatorController {
  constructor(private readonly translatorService: TranslatorService) {}

  @Post('/translate/:languageId')
  async translate(
    @Param('languageId') languageId: string,
    @Body('input') input: string,
  ) {
    return await this.translatorService.translate({
      input,
      languageId,
    });
  }
}
