import { User } from '@prisma/client';
import { handleError } from 'utils/handleError';
import { ScheduleService } from '../schedule.service';
import { PracticeType } from '@prisma/client';

export default async function createInitialUserSchedule(
  this: ScheduleService,
  user: User,
) {
  try {
    // 1. Find the default bot (e.g., seeded with name "Greeting Bot")
    const baseBot = await this.prismaSerivce.bot.findFirst({
      where: { name: 'Greeting Bot' }, // Adjust name if needed
    });

    if (!baseBot) throw new Error('Base bot not found');

    // 2. Create UserBot instance for this user
    const userBot = await this.prismaSerivce.userBot.create({
      data: {
        userId: user.id,
        botId: baseBot.id,
        nickname: 'My First Bot',
        context: 'Introduction and greetings',
      },
    });

    // 3. Create ScheduleItem with a link to the UserBot
    await this.prismaSerivce.scheduleItem.create({
      data: {
        userId: user.id,
        type: PracticeType.CONVERSATION,
        nextReview: new Date(),
        repetition: 0,
        easeFactor: 2.5,
        lastReviewed: null,

        bot: {
          create: {
            userBotId: userBot.id,
          },
        },
      },
    });
  } catch (error) {
    const customError = handleError(
      error,
      'Error creating initial user schedule',
    );
    throw customError;
  }
}
