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
    @Get()
    @Roles(UserRole.ADMIN, UserRole.TEACHER)
    findAll(
        @Query('page') page: string,
        @Query('limit') limit: string,
    ){
        return this.attendanceService.findAll(
                Number(page || 1),
                Number(limit || 10),
        )
    }


    // Get Attendance by STUDENT.   Admin , Teacher and Student
    @Get('student/:studentId')
    @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
    findByStudent(
        @Param('studentId', ParseIntPipe) studentId: number,
    ){
        return this.attendanceService.findByStudent(studentId);
    }


    // Get Attendance by CLASS.   Admin , Teacher and Student
        @Get('class/:classId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findByClass(
    @Param('classId', ParseIntPipe) classId: number,
  ) {
    return this.attendanceService.findByClass(
      classId,
    );
  }


//   Get Attendance by ID.   Admin , Teacher and Student
     @Get(':id')
  @Roles(
    UserRole.ADMIN,
    UserRole.TEACHER,
    UserRole.STUDENT,
  )
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.attendanceService.findOne(id);
  }


//   Update Attendance by ID.   Admin , Teacher

    @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(
      id,
      dto,
    );
  }

//   Delete Attendance by ID.   Admin , Teacher
        @Delete(':id')
        @Roles(UserRole.ADMIN)
        remove(
            @Param('id', ParseIntPipe) id: number,
        ) {
            return this.attendanceService.remove(id);
  }
}
