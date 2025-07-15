import { Module } from '@nestjs/common';
import { KanjiBuilderService } from './kanji-builder.service';
import { KanjiBuilderController } from './kanji-builder.controller';

@Module({
  providers: [KanjiBuilderService],
  controllers: [KanjiBuilderController],
})
export class KanjiBuilderModule {}
