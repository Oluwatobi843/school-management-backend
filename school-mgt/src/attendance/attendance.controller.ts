import { Body,
         Controller,
         Delete,
         Get,
         Param,
         ParseIntPipe,
         Patch,
         Post,
         Query,
         Req,
         UseGuards,

} from '@nestjs/common';


import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
    constructor(
        private readonly attendanceService: AttendanceService,
    ){}

    // Create Attendance for Admin and Teacher
    @Post()
    @Roles(UserRole.ADMIN, UserRole.TEACHER)
    create(
        @Body() dto: CreateAttendanceDto,
        @Req() req: any,

    ){
        return this.attendanceService.create(dto, req.user.id);
    }


    // Get All Attendance for Admin and Teacher

}