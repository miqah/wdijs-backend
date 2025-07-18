import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { FirebaseModule } from './firebase/firebase.module';
import { GeminiModule } from './gemini/gemini.module';
import { TranslatorModule } from './translator/translator.module';
import { KanjiBuilderModule } from './kanji-builder/kanji-builder.module';
import { APP_GUARD } from '@nestjs/core';
import { FirebaseAuthGuard } from 'app/firebase/guards/firebase-auth.guard';
import { VoskModule } from './vosk/vosk.module';

@Module({
  imports: [
    ConfigModule.forRoot({ cache: true }),
    AuthModule,
    PrismaModule,
    FirebaseModule,
    GeminiModule,
    TranslatorModule,
    KanjiBuilderModule,
    VoskModule,
  ],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: FirebaseAuthGuard
  }],
})
export class AppModule {}
