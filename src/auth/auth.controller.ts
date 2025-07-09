import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../../generated/prisma';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/login')
  login(): Promise<User | null> {
    return this.authService.login();
  }

  @Get('/signup')
  signup(): Promise<User | null> {
    return this.authService.signup();
  }
}
