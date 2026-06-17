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

// 👉 import your JWT guard (adjust path if needed)
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';



@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  //  CREATE STUDENT 
  // @UseGuards(JwtAuthGuard)
  // @Post()
  // create(@Body() dto: CreateStudentDto, @Req() req: any) {
  //   return this.studentService.create(dto, req.user.sub);
  // }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateStudentDto, @Req() req: any) {
   if(!req.user?.sub){
    throw new Error('User not authenticated properly')
   }
  return this.studentService.create(dto, req.user?.sub);
}

  //  GET ALL 
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.studentService.findAll();
  }

  //  GET BY ADMISSION 
  @Get('admission/:admissionNumber')
  findByAdmissionNumber(
    @Param('admissionNumber') admissionNumber: string,
  ) {
    return this.studentService.findByAdmissionNumber(admissionNumber);
  }

  //  GET ONE 
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.findOne(id);
  }

  //  UPDATE 
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentService.update(id, dto);
  }

  //  DELETE 
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.remove(id);
  }
}