import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { User, UserRole } from 'src/auth/entities/user.entity';
import { Class } from '../classes/entities/class.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
  ) {}

  private async findClassById(id: number): Promise<Class> {
    const schoolClass = await this.classRepository.findOne({
      where: { id },
    });

    if (!schoolClass) {
      throw new NotFoundException(`Class with ID ${id} not found.`);
    }

    return schoolClass;
  }

  // CREATE STUDENT
  async create(dto: CreateStudentDto, adminId: number) {
    const admin = await this.userRepository.findOne({
      where: { id: adminId },
    });

    if (!admin) {
      throw new BadRequestException('Admin user not found');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const existingStudent = await this.studentRepository.findOne({
      where: { admissionNumber: dto.admissionNumber },
    });

    if (existingStudent) {
      throw new BadRequestException(
        'Admission number already exists',
      );
    }

    const schoolClass = await this.findClassById(dto.classId);

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const studentUser = this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: hashedPassword,
      role: UserRole.STUDENT,
    });

    const savedUser = await this.userRepository.save(studentUser);

    const student = this.studentRepository.create({
      admissionNumber: dto.admissionNumber,
      gender: dto.gender,
      dateOfBirth: dto.dateOfBirth,
      class: schoolClass,
      phoneNumber: dto.phoneNumber,
      address: dto.address,
      user: savedUser,
    });

    const savedStudent = await this.studentRepository.save(student);

    return {
      message: 'Student created successfully',
      data: savedStudent,
    };
  }

  // GET ALL STUDENTS
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [students, total] =
      await this.studentRepository.findAndCount({
        skip,
        take: limit,
        order: {
          createdAt: 'DESC',
        },
      });

    return {
      message: 'Students fetched successfully',
      data: students,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // GET STUDENT BY ADMISSION NUMBER
  // ADMIN + TEACHER ONLY
  async findByAdmissionNumber(admissionNumber: string) {
    const student = await this.studentRepository.findOne({
      where: { admissionNumber },
      relations: ['user'],
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return {
      message: 'Student retrieved successfully',
      data: student,
    };
  }

  // GET SINGLE STUDENT
  // ADMIN + TEACHER + STUDENT
  async findOne(id: number, currentUser: any) {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!student) {
      throw new NotFoundException(
        `Student with ID ${id} not found`,
      );
    }

    // STUDENT CAN ONLY VIEW HIS/HER OWN PROFILE
    if (
      currentUser.role === UserRole.STUDENT &&
      student.user.id !== currentUser.id
    ) {
      throw new ForbiddenException(
        'You are not allowed to access this student profile',
      );
    }

    return {
      message: 'Student retrieved successfully',
      data: student,
    };
  }

  // UPDATE STUDENT
  // ADMIN ONLY
  async update(id: number, dto: UpdateStudentDto) {
    const student = await this.studentRepository.findOne({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException(
        `Student with ID ${id} not found`,
      );
    }

    const { classId, ...otherFields } = dto;

    Object.assign(student, otherFields);

    if (classId !== undefined) {
      student.class = await this.findClassById(classId);
    }

    const updated = await this.studentRepository.save(student);

    return {
      message: 'Student updated successfully',
      data: updated,
    };
  }

  // DELETE STUDENT
  // ADMIN ONLY
  async remove(id: number) {
    const student = await this.studentRepository.findOne({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException(
        `Student with ID ${id} not found`,
      );
    }

    await this.studentRepository.delete(id);

    return {
      message: 'Student deleted successfully',
    };
  }
}