import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  //  CREATE STUDENT 
  async create(dto: CreateStudentDto, userId: number) {
    // 1. Check if user exists (from Auth/JWT)
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // 2. Prevent duplicate admission number
    const existingStudent = await this.studentRepository.findOne({
      where: { admissionNumber: dto.admissionNumber },
    });

    if (existingStudent) {
      throw new BadRequestException('Admission number already exists');
    }

    // 3. Create student linked to user
    const student = this.studentRepository.create({
      admissionNumber: dto.admissionNumber,
      gender: dto.gender,
      dateOfBirth: dto.dateOfBirth,
      className: dto.className,
      phoneNumber: dto.phoneNumber,
      address: dto.address,
      user: user, // 👈 relation link (important)
    });

    const savedStudent = await this.studentRepository.save(student);

    return {
      message: 'Student created successfully',
      data: savedStudent,
    };
  }

  //  GET ALL STUDENTS 
  async findAll() {
    const students = await this.studentRepository.find({
      relations: {
        user: true,
      },
    });

    return {
      message: 'Students fetched successfully',
      data: students,
    };
  }

  //  GET BY ADMISSION NUMBER
  async findByAdmissionNumber(admissionNumber: string) {
    return this.studentRepository.findOne({
      where: { admissionNumber },
      relations: {
        user: true,
      },
    });
  }

  //  GET ONE STUDENT 
  async findOne(id: number) {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: {
        user: true,
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return {
      message: 'Student retrieved successfully',
      data: student,
    };
  }

  //  UPDATE STUDENT 
  async update(id: number, dto: UpdateStudentDto) {
    const student = await this.studentRepository.findOneBy({ id });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    const updatedStudent = await this.studentRepository.save({
      ...student,
      ...dto,
    });

    return {
      message: 'Student updated successfully',
      data: updatedStudent,
    };
  }

  //  DELETE STUDENT 
  async remove(id: number) {
    const student = await this.studentRepository.findOneBy({ id });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    await this.studentRepository.delete(id);

    return {
      message: 'Student deleted successfully',
    };
  }
}