import { Module } from '@nestjs/common';
import { WordService } from './word.service';
import { KuromojiModule } from 'app/kuromoji/kuromoji.module';

@Module({
  imports: [KuromojiModule],
  providers: [WordService],
  exports: [WordService],
})
export class WordModule {}
