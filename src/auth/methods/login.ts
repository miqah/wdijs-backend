import { AuthService } from './../auth.service';
export function login(this: AuthService) {
  return this.prismaService.user.findFirst({});
}
