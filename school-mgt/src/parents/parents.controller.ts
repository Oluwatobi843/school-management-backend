import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { ParentsService } from './parents.service';

import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { QueryParentDto } from './dto/query-parent.dto';
import { LinkParentStudentDto } from './dto/link-parent-student.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('parents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ParentsController {
  constructor(
    private readonly parentsService: ParentsService,
  ) {}

  
  // CREATE PARENT
  

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateParentDto) {
    return this.parentsService.create(dto);
  }

  
  // GET ALL PARENTS
  

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findAll(@Query() query: QueryParentDto) {
    return this.parentsService.findAll(query);
  }

  
  // GET PARENT BY ID
  

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.parentsService.findOne(id);
  }

  
  // UPDATE PARENT
  

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateParentDto,
  ) {
    return this.parentsService.update(id, dto);
  }

  
  // LINK STUDENT TO PARENT
 

  @Post(':id/students')
  @Roles(UserRole.ADMIN)
  linkStudent(
    @Param('id', ParseIntPipe) parentId: number,
    @Body() dto: LinkParentStudentDto,
  ) {
    return this.parentsService.linkStudent(
      parentId,
      dto,
    );
  }

  
  // GET PARENT'S STUDENTS
  

  @Get(':id/students')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  getStudents(
    @Param('id', ParseIntPipe) parentId: number,
  ) {
    return this.parentsService.getStudents(parentId);
  }

  
  // GET ONE PARENT-STUDENT RELATIONSHIP

  @Get(':id/students/:studentId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  getStudentRelationship(
    @Param('id', ParseIntPipe) parentId: number,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.parentsService.getStudentRelationship(
      parentId,
      studentId,
    );
  }

  
  // UPDATE PARENT-STUDENT RELATIONSHIP
 
  @Patch(':id/students/:studentId')
  @Roles(UserRole.ADMIN)
  updateStudentRelationship(
    @Param('id', ParseIntPipe) parentId: number,
    @Param('studentId', ParseIntPipe) studentId: number,
    @Body() dto: LinkParentStudentDto,
  ) {
    return this.parentsService.updateStudentRelationship(
      parentId,
      studentId,
      dto,
    );
  }

  

 
}