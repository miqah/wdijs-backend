import { User } from '@prisma/client';
import { ConflictException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { handleError } from '../../../utils/handleError';

export default async function signUp(
  this: AuthService,
  email: string,
): Promise<User | null> {
  try {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const newUser = await this.prismaService.user.create({
      data: {
        email,
      },
    });

    return newUser;
  } catch (error: unknown) {
    const handledError = handleError(error, 'Sign Up Error');
    throw handledError;
  }
}
