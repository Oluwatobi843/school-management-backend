import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Teacher } from './entities/teacher.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TeachersService {
    constructor(
        @InjectRepository(Teacher)
        private teacherRepo: Repository<Teacher>,


    ){}

    // Create a new teacher
    create (dto: CreateTeacherDto){
        const teacher = this.teacherRepo.create(dto);
        return this.teacherRepo.save(teacher);
    }


    // Get all teachers
    findAll(){
        return this.teacherRepo.find();
    }

    // Get a teacher by ID
    async findOne(id: number){
        const teacher = await this.teacherRepo.findOne({where:{id}});

        if(!teacher){
            throw new NotFoundException('Teacher not found');
        }
        return teacher;
    }


    // Update a teacher
    async update(id: number, dto: UpdateTeacherDto){
        const teacher = await this.findOne(id);
        Object.assign(teacher, dto)
        return this.teacherRepo.save(teacher)
    }


    // Delete a teacher
    async remove(id: number){
        const teacher = await this.findOne(id);
        return this.teacherRepo.remove(teacher);
    }

}
