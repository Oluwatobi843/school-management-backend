import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';

import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/entities/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  // CREATE STUDENT (ADMIN ONLY)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(
    @Body() dto: CreateStudentDto,
    @Req() req: any,
  ) {
    return this.studentService.create(dto, req.user.sub);
  }

  // GET ALL STUDENTS (ADMIN + TEACHER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get()
  findAll() {
    return this.studentService.findAll();
  }

  // GET STUDENT BY ADMISSION NUMBER
  // ADMIN + TEACHER + STUDENT
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @Get('admission/:admissionNumber')
  findByAdmissionNumber(
    @Param('admissionNumber') admissionNumber: string,
  ) {
    return this.studentService.findByAdmissionNumber(admissionNumber);
  }

  // GET SINGLE STUDENT
  // ADMIN + TEACHER + STUDENT (service ensures students only see themselves)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.studentService.findOne(id, req.user);
  }

  // UPDATE STUDENT (ADMIN ONLY)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentService.update(id, dto);
  }

  // DELETE STUDENT (ADMIN ONLY)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.studentService.remove(id);
  }
}