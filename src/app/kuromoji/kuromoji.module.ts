import { Module } from '@nestjs/common';
import { KuromojiService } from './kuromoji.service';

@Module({
  providers: [KuromojiService],
  exports: [KuromojiService],
})
export class KuromojiModule {}
