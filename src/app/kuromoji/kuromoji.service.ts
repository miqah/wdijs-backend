import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as kuromoji from 'kuromoji';

@Injectable()
export class KuromojiService implements OnModuleInit {
  private tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures>;
  private readonly logger = new Logger(KuromojiService.name);

  async onModuleInit() {
    this.logger.log('Building Kuromoji tokenizer...');
    this.tokenizer = await new Promise((resolve, reject) => {
      kuromoji
        .builder({ dicPath: 'node_modules/kuromoji/dict' })
        .build((err, tokenizer) => {
          if (err) {
            this.logger.error('Failed to build tokenizer', err);
            return reject(err);
          }
          this.logger.log('Kuromoji tokenizer ready.');
          resolve(tokenizer);
        });
    });
  }

  tokenize(text: string): kuromoji.IpadicFeatures[] {
    if (!this.tokenizer) {
      throw new Error('Tokenizer not initialized yet.');
    }
    return this.tokenizer.tokenize(text);
  }
}
