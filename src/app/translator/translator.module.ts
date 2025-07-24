import { Module } from '@nestjs/common';
import { TranslatorController } from './translator.controller';
import { TranslatorService } from './translator.service';
import { GeminiModule } from '../gemini/gemini.module';
import { FirebaseAuthGuard } from 'app/firebase/guards/firebase-auth.guard';
import { FirebaseService } from 'app/firebase/firebase.service';
import { ConfigModule } from '@nestjs/config';
import { KuromojiModule } from 'app/kuromoji/kuromoji.module';

@Module({
  imports: [GeminiModule, ConfigModule, KuromojiModule],
  providers: [TranslatorService, FirebaseService, FirebaseAuthGuard],
  controllers: [TranslatorController],
})
export class TranslatorModule {}
