import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';

import { TeachersService } from './teachers.service';
import { QueryTeacherDto } from './dto/query-teacher.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { AssignSubjectsDto } from './dto/assign-subjects.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('teachers')
export class TeachersController {
  constructor(
    private readonly teachersService: TeachersService,
  ) {}

  // Create a new teacher
  @Post()
  create(@Body() dto: CreateTeacherDto) {
    return this.teachersService.create(dto);
  }

  // Get all teachers
  @Get()
  findAll(@Query() query: QueryTeacherDto) {
    return this.teachersService.findAll(query);
  }

  // Get a teacher by ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teachersService.findOne(id);
  }

  // Update a teacher
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTeacherDto,
  ) {
    return this.teachersService.update(id, dto);
  }

  @Patch(':id/subjects')
@Roles(UserRole.ADMIN)
assignSubjects(
  @Param('id') id: string,
  @Body() dto: AssignSubjectsDto,
) {
  return this.teachersService.assignSubjects(
    +id,
    dto.subjectIds,
  );
}

  // Delete a teacher
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teachersService.remove(id);
  }
}