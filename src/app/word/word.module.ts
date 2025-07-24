import { Module } from '@nestjs/common';
import { WordService } from './word.service';

@Module({
  providers: [WordService]
})
export class WordModule {}
