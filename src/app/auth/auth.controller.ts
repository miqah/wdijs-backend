import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '@prisma/client';
import { Public } from 'decorators/public.decorator';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/sign-up')
  async signup(
    @Body() body: { email: string; firebaseUid: string },
  ): Promise<User | null> {
    return this.authService.signUp(body);
  }
}
