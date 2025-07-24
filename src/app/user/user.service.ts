import { Injectable } from '@nestjs/common';
import { PrismaService } from 'app/prisma/prisma.service';
import getUserBots from './methods/getUserBots';

@Injectable()
export class UserService {
  constructor(protected readonly prismaService: PrismaService) {}

  getUserBots = getUserBots;
}
