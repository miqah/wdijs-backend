import { Controller, Get, Param } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserRequest } from 'decorators/user.decorator';
import { ScheduleService } from './schedule.service';

@Controller('schedule')
export class ScheduleController {
    constructor(private readonly scheduleService: ScheduleService){}

    @Get('/')
    getUserSchedule(@UserRequest() user: User){
        return this.scheduleService.getUserSchedule(user)
    }
}
