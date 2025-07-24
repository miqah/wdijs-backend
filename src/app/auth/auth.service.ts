import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseService } from '../firebase/firebase.service';
import signUp from './methods/signUp';
import { ScheduleService } from 'app/schedule/schedule.service';

@Injectable()
export class AuthService {
  constructor(
    protected readonly prismaService: PrismaService,
    protected readonly firebaseService: FirebaseService,
    protected readonly scheduleService: ScheduleService,
  ) {}

  signUp = signUp;
}
