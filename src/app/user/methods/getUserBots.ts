import { User } from '@prisma/client';
import { UserService } from '../user.service';
import { handleError } from 'utils/handleError';

export default async function getUserBots(this: UserService, user: User) {
  try {
    const userBots = this.prismaService.userBot.findMany({
      where: {
        userId: user.id,
      },
    });

    return userBots;
  } catch (error) {
    const customError = handleError(error, 'Failed to fetch user bots');
    throw customError;
  }
}
