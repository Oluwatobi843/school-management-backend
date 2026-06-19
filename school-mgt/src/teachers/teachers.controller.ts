import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { TeachersService } from './teachers.service';

@Controller('teachers')
export class TeachersController {

    constructor(private readonly teachersService: TeachersService){}

    // Create a new teacher
    @Post()
    create(@Body() dto: CreateTeacherDto){
        return this.teachersService.create(dto);
    }

    // Get all teachers
    @Get()
    findAll(){
        return this.teachersService.findAll();
    }

    // Get a teacher by ID
    @Get(':id')
    findOne(@Param('id') id: string){
        return this.teachersService.findOne(+id)
    }


    // Update a teacher
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateTeacherDto){
        return this.teachersService.update(+id, dto)
    }

    // Delete a teacher
    @Delete(':id')
    remove(@Param('id') id: string){
        return this.teachersService.remove(+id)
    }

}
