import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '@prisma/client';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-in')
  login(): Promise<User | null> {
    return this.authService.signIn();
  }

  @Post('/sign-up')
  async signup(@Body() body: { email: string }): Promise<User | null> {
    const { email } = body;
    return this.authService.signUp(email);
  }
}
