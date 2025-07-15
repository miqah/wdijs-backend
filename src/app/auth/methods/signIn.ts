import { AuthService } from '../auth.service';
export function signIn(this: AuthService) {
  return this.prismaService.user.findFirst({});
}
