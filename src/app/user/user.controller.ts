import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRequest } from 'decorators/user.decorator';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/bots')
  getUserBots(@UserRequest() user: User) {
    return this.userService.getUserBots(user);
  }
}
