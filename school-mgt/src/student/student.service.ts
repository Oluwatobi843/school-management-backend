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

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  //  CREATE STUDENT 
  async create(dto: CreateStudentDto, adminId: number) {
    // check admin exists
    const admin = await this.userRepository.findOne({
      where: { id: adminId },
    });

    if (!admin) {
      throw new BadRequestException('Admin user not found');
    }

    // check email
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // check admission number
    const existingStudent = await this.studentRepository.findOne({
      where: { admissionNumber: dto.admissionNumber },
    });

    if (existingStudent) {
      throw new BadRequestException('Admission number already exists');
    }

    // hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // create USER (auth account)
    const studentUser = this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: hashedPassword,
      role: UserRole.STUDENT,
    });

    const savedUser = await this.userRepository.save(studentUser);

    // create STUDENT (profile)
    const student = this.studentRepository.create({
      admissionNumber: dto.admissionNumber,
      gender: dto.gender,
      dateOfBirth: dto.dateOfBirth,
      className: dto.className,
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

  //  GET ALL STUDENTS 
  async findAll() {
    const students = await this.studentRepository.find({
      relations: { user: true },
    });

    return {
      message: 'Students fetched successfully',
      data: students,
    };
  }

  //  GET BY ADMISSION 
  async findByAdmissionNumber(admissionNumber: string) {
    const student = await this.studentRepository.findOne({
      where: { admissionNumber },
      relations: { user: true },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return {
      message: 'Student retrieved successfully',
      data: student,
    };
  }

  //  GET ONE (ROLE PROTECTED) 
  async findOne(id: number, currentUser: any) {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // STUDENT CAN ONLY SEE OWN PROFILE
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

  //  UPDATE 
  async update(id: number, dto: UpdateStudentDto) {
    const student = await this.studentRepository.findOne({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    Object.assign(student, dto);

    const updated = await this.studentRepository.save(student);

    return {
      message: 'Student updated successfully',
      data: updated,
    };
  }

  //  DELETE 
  async remove(id: number) {
    const student = await this.studentRepository.findOne({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    await this.studentRepository.delete(id);

    return {
      message: 'Student deleted successfully',
    };
  }
}