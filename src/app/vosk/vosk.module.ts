import { Module } from '@nestjs/common';
import { VoskService } from './vosk.service';

@Module({
  providers: [VoskService],
  exports: [VoskService]
})
export class VoskModule {}
