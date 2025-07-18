import { MessageEvent, NotFoundException } from '@nestjs/common';
import { TranslationRequestDto } from '../dtos/translation.dto';
import { convertToWav } from 'utils/convertToWav';
import { Observable } from 'rxjs';
import { TranslatorService } from '../translator.service';
import { randomUUID } from 'crypto';

export function translate(this: TranslatorService, {
  translationRequestDto,
}: {
  translationRequestDto: TranslationRequestDto;
}): Observable<MessageEvent> {
  this.logger.log('Starting streaming translation process');
  
  return new Observable<MessageEvent>((subscriber) => {
    (async () => {
      try {
        this.logger.log('Processing translation request');
        const { config, audio } = translationRequestDto;
        const { languageId } = config;
        
        this.logger.log(`Request for language ID: ${languageId}`);
        
        if (!languageId) {
          this.logger.error(`Invalid language ID: ${languageId}`);
          subscriber.error(
            new NotFoundException(`Language id ${languageId} not found`),
          );
          return;
        }
        
        this.logger.log('Looking up language in database');
        const language = await this.prismaService.language.findFirst({
          where: { id: languageId },
        });
        
        if (!language) {
          this.logger.error(`Language with ID ${languageId} not found in database`);
          subscriber.error(
            new NotFoundException(`Language with id ${languageId} not found`),
          );
          return;
        }
        
        this.logger.log(`Found language: ${language.name}`);
        
        if (!audio) {
          this.logger.error('No audio data provided in request');
          subscriber.error(new NotFoundException('Missing input audio'));
          return;
        }
        
        this.logger.log('Decoding base64 audio data');
        const m4aBuffer = Buffer.from(audio, 'base64');
        this.logger.log(`Decoded audio size: ${m4aBuffer.length} bytes`);
        
        this.logger.log('Converting audio to WAV format');
        const wavBuffer = await convertToWav(m4aBuffer);
        this.logger.log(`Converted WAV size: ${wavBuffer.length} bytes`);
        
        this.logger.log('Transcribing audio with Vosk');
        const response = await this.voskService.transcribeBuffer(
          wavBuffer,
          'en',
        );
        this.logger.log(`Transcription result: "${response}"`);
        
        const responseMessageKey = randomUUID()
        const translationMessageKey = randomUUID()

        // Send recognized text first
        this.logger.log('Sending initial transcription to client');
        subscriber.next({
          data: JSON.stringify({
            response,
            key: responseMessageKey,
          }),
        });
        
        this.logger.log('Starting streaming translation with Gemini');
        let chunkCount = 0;
        
        // Create a streaming translation
        for await (const chunk of this.geminiService.translate(
          response,
          language.name,
        )) {
          chunkCount++;
          this.logger.log(`Sending translation chunk #${chunkCount}: "${chunk.substring(0, 50)}${chunk.length > 50 ? '...' : ''}"`);
          
          subscriber.next({
            data: JSON.stringify({
              transcription: chunk,
              key: translationMessageKey
            }),
          });
        }
        
        this.logger.log(`Translation complete. Sent ${chunkCount} chunks.`);
        subscriber.complete();
      } catch (error) {
        // Log the detailed error
        this.logger.error('Error in streaming translation process', error);
        if (error instanceof Error) {
          this.logger.error(`Error message: ${error.message}`);
          this.logger.error(`Error stack: ${error.stack}`);
        } else {
          this.logger.error(`Unknown error: ${String(error)}`);
        }
        
        subscriber.error(error);
      }
    })();
  });
}