import {
  Controller,
 Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';

import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { QueryClassDto } from './dto/query-class.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

 
  // Create Class (ADMIN only)
  
  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createClassDto: CreateClassDto) {
    return this.classesService.create(createClassDto);
  }

  
  // Get All Classes
  // ADMIN, TEACHER, STUDENT
  
  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  findAll(@Query() query: QueryClassDto) {
    return this.classesService.findAll(query);
  }


  // Get Single Class
  // ADMIN, TEACHER, STUDENT

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(+id);
  }


  // Update Class (ADMIN only)
  
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateClassDto: UpdateClassDto,
  ) {
    return this.classesService.update(+id, updateClassDto);
  }

  
  // Delete Class (ADMIN only)
  
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.classesService.remove(+id);
  }
}