import { startOfTomorrow } from 'date-fns';
import { ScheduleService } from '../schedule.service';
import { User } from '@prisma/client';
import { handleError } from 'utils/handleError';

export default async function getUserSchedule(
  this: ScheduleService,
  user: User,
) {
  try {
    this.logger.log(`Fetching user schedule with user id ${user.id}`);

    const schedule = await this.prismaSerivce.scheduleItem.findMany({
      where: {
        userId: user.id,
        nextReview: {
          lt: startOfTomorrow(),
        },
      },
      include: {
        bot: {
          include: {
            userBot: {
              include: {
                bot: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(`Found ${schedule.length} schedule(s) due or overdue`);
    return schedule;
  } catch (error) {
    const customError = handleError(error, 'Error fetching user schedule');
    throw customError;
  }
}
