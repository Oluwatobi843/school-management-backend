import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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

export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

 
  // CREATE CLASS
  // ADMIN ONLY
 
  @Post()
  // @Roles(UserRole.ADMIN)
  create(@Body() createClassDto: CreateClassDto) {
    return this.classesService.create(createClassDto);
  }

 
  // GET ALL CLASSES
  // ADMIN + TEACHER + STUDENT
 
  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  findAll(@Query() query: QueryClassDto) {
    return this.classesService.findAll(query);
  }

 
  // GET ONE CLASS
  // ADMIN + TEACHER + STUDENT
 
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(+id);
  }


  // UPDATE CLASS
  // ADMIN ONLY
 
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateClassDto: UpdateClassDto,
  ) {
    return this.classesService.update(+id, updateClassDto);
  }

 
  // DELETE CLASS
  // ADMIN ONLY
  
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.classesService.remove(+id);
  }
}