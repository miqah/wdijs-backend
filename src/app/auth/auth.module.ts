import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseModule } from '../firebase/firebase.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ScheduleModule } from 'app/schedule/schedule.module';

@Module({
  imports: [FirebaseModule, PrismaModule, ScheduleModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
