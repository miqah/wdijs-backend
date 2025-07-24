import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import { TranslatorService } from '../translator.service';

export function getTranslatorIntroduction(
  this: TranslatorService,
  {
    userBotId,
  }: {
    userBotId: string;
  },
): Observable<MessageEvent> {
  return new Observable<MessageEvent>((subscriber) => {
    (async () => {
      try {
        this.logger.log(
          `Starting introduction stream for userBotId: ${userBotId}`,
        );

        const userBot = await this.prismaService.userBot.findFirst({
          where: { id: Number(userBotId) },
          include: { bot: true },
        });

        if (!userBot) {
          this.logger.error(`UserBot with ID ${userBotId} not found`);
          throw new Error(`UserBot with ID ${userBotId} not found`);
        }

        const baseContext = userBot.bot.basePrompt ?? '';
        const userContext = userBot.context ?? '';
        const language = 'japanese';

        this.logger.log(
          `Generating introduction for userBot "${userBot.bot.name}" in language: ${language}`,
        );
        this.logger.log(`Base context: ${baseContext.slice(0, 100)}...`);
        this.logger.log(`User context: ${userContext.slice(0, 100)}...`);

        for await (const chunk of this.geminiService.getBotIntroduction({
          baseContext,
          userContext,
          targetLang: language,
        })) {
          this.logger.log(
            `Streaming introduction chunk: ${chunk.slice(0, 60)}...`,
          );

          subscriber.next({
            data: JSON.stringify({ introduction: chunk }),
          });
        }

        this.logger.log(
          `Completed introduction stream for userBotId: ${userBotId}`,
        );
        subscriber.complete();
      } catch (error) {
        this.logger.error('Error in introduction stream', error);
        subscriber.error(error);
      }
    })();
  });
}
