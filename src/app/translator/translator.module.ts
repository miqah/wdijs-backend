import { Module } from '@nestjs/common';
import { TranslatorController } from './translator.controller';
import { TranslatorService } from './translator.service';
import { GeminiModule } from '../gemini/gemini.module';
import { FirebaseAuthGuard } from 'app/firebase/guards/firebase-auth.guard';
import { FirebaseService } from 'app/firebase/firebase.service';
import { ConfigModule } from '@nestjs/config';
import { VoskModule } from 'app/vosk/vosk.module';

@Module({
  imports: [GeminiModule, ConfigModule, VoskModule],
  providers: [TranslatorService, FirebaseService, FirebaseAuthGuard],
  controllers: [TranslatorController],
})
export class TranslatorModule {}
