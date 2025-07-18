import { Injectable, OnModuleInit } from '@nestjs/common';
import { Model, Recognizer } from 'vosk';
import * as fs from 'fs';
import * as path from 'path';
import * as wav from 'wav';
import { Readable } from 'stream';

@Injectable()
export class VoskService implements OnModuleInit {
  private models: Record<string, Model> = {};

  onModuleInit() {
    const rootPath = path.resolve(__dirname, '../../../..');

    const supportedModels: Record<string, string> = {
      ja: 'vosk-model-ja-0.22',
      en: 'vosk-model-small-en-us-0.15', 
    };

    for (const [lang, dirName] of Object.entries(supportedModels)) {
      const modelPath = path.resolve(rootPath, `models/${dirName}`);
      if (!fs.existsSync(modelPath)) {
        throw new Error(`Model for language '${lang}' not found at ${modelPath}`);
      }
      this.models[lang] = new Model(modelPath);
      console.log(`Loaded Vosk model for language: ${lang}`);
    }
  }

  async transcribeBuffer(buffer: Buffer, lang: 'ja' | 'en'): Promise<string> {
    const model = this.models[lang];
    if (!model) {
      throw new Error(`No model loaded for language: ${lang}`);
    }

    return new Promise((resolve, reject) => {
      const wfReader = new wav.Reader();

      wfReader.on('format', (format) => {
        if (format.audioFormat !== 1 || format.sampleRate !== 16000 || format.channels !== 1) {
          return reject('Audio must be WAV PCM mono 16kHz');
        }

        const rec = new Recognizer({ model, sampleRate: format.sampleRate });
        rec.setWords(true);

        wfReader.on('data', (data) => {
          rec.acceptWaveform(data);
        });

        wfReader.on('end', () => {
          const result = rec.finalResult();
          resolve(result.text || '');
        });
      });

      const stream = Readable.from(buffer);
      stream.pipe(wfReader);
    });
  }
}