import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Teacher } from './entities/teacher.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepo: Repository<Teacher>,
  ) {}

  // Create a new teacher
  async create(dto: CreateTeacherDto): Promise<Teacher> {
    const existingTeacher = await this.teacherRepo.findOne({
      where: { employeeId: dto.employeeId },
    });

    if (existingTeacher) {
      throw new ConflictException(
        'A teacher with this employee ID already exists',
      );
    }

    const teacher = this.teacherRepo.create({
      employeeId: dto.employeeId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      gender: dto.gender,
      dateOfBirth: new Date(dto.dateOfBirth),
      phone: dto.phoneNumber,
      qualification: dto.qualification,
      specialization: dto.specialization,
      hireDate: new Date(dto.hireDate),
      address: dto.address,
      
    });

    return await this.teacherRepo.save(teacher);
  }

  // Get all teachers
  async findAll(): Promise<Teacher[]> {
    return await this.teacherRepo.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // Get one teacher by ID
  async findOne(id: number): Promise<Teacher> {
    const teacher = await this.teacherRepo.findOne({
      where: { id },
    });

    if (!teacher) {
      throw new NotFoundException(
        `Teacher with ID ${id} not found`,
      );
    }

    return teacher;
  }

  // Update a teacher
  async update(
    id: number,
    dto: UpdateTeacherDto,
  ): Promise<Teacher> {
    const teacher = await this.findOne(id);

    Object.assign(teacher, {
      ...dto,
      dateOfBirth: dto.dateOfBirth
        ? new Date(dto.dateOfBirth)
        : teacher.dateOfBirth,
      hireDate: dto.hireDate
        ? new Date(dto.hireDate)
        : teacher.hireDate,
      phone: dto.phoneNumber ?? teacher.phone,
    });

    return await this.teacherRepo.save(teacher);
  }

  // Delete a teacher
  async remove(
    id: number,
  ): Promise<{ message: string }> {
    const teacher = await this.findOne(id);

    await this.teacherRepo.remove(teacher);

    return {
      message: 'Teacher deleted successfully',
    };
  }
}