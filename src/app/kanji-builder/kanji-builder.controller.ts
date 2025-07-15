import { KanjiBuilderService } from './kanji-builder.service';
import { Controller, Get } from '@nestjs/common';

@Controller('kanji-builder')
export class KanjiBuilderController {
  constructor(private readonly kanjiBuilderService: KanjiBuilderService) {}

  @Get('/radicals')
  getRadicals() {
    console.log('1');
    return this.kanjiBuilderService.getRadicals();
  }
}
