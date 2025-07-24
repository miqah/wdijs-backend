import { Injectable, Logger } from '@nestjs/common';
import getUserSchedule from './methods/getUserSchedule';
import { PrismaService } from 'app/prisma/prisma.service';
import createInitialUserSchedule from './methods/createInitialUserSchedule';

@Injectable()
export class ScheduleService {
  protected readonly logger = new Logger(ScheduleService.name);
  constructor(protected readonly prismaSerivce: PrismaService) {}

  getUserSchedule = getUserSchedule;
  createInitialUserSchedule = createInitialUserSchedule;
}
