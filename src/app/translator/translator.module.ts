import { Module } from '@nestjs/common';
import { TranslatorController } from './translator.controller';
import { TranslatorService } from './translator.service';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
  imports: [GeminiModule],
  providers: [TranslatorService],
  controllers: [TranslatorController],
})
export class TranslatorModule {}
