import { User } from '../../../generated/prisma';
import { AuthService } from '../auth.service';

export function signup(this: AuthService): Promise<User | null> {
  return this.prismaService.user.findFirst({});
}
