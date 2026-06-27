
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Teacher } from './entities/teacher.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { User, UserRole } from '../auth/entities/user.entity';

@Injectable()
export class TeachersService {
  private readonly logger = new Logger(TeachersService.name);

  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepo: Repository<Teacher>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly dataSource: DataSource,
  ) {}

  // =====================================================
  // Helper Methods
  // =====================================================

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private sanitizeUser(user: User) {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  private async validateEmail(email: string): Promise<void> {
    const existingUser = await this.userRepo.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException(
        'A user with this email already exists.',
      );
    }
  }

  private async validateEmployeeId(
    employeeId: string,
  ): Promise<void> {
    const existingTeacher = await this.teacherRepo.findOne({
      where: { employeeId },
    });

    if (existingTeacher) {
      throw new ConflictException(
        'A teacher with this employee ID already exists.',
      );
    }
  }

  // =====================================================
  // Create Teacher
  // =====================================================

  async create(createTeacherDto: CreateTeacherDto) {
    await this.validateEmail(createTeacherDto.email);
    await this.validateEmployeeId(createTeacherDto.employeeId);

    try {
      const teacher =
        await this.dataSource.transaction(
          async (manager) => {
            // Hash Password
            const hashedPassword =
              await this.hashPassword(
                createTeacherDto.password,
              );

            // Create User
            const user = manager.create(User, {
              firstName:
                createTeacherDto.firstName,
              lastName:
                createTeacherDto.lastName,
              email: createTeacherDto.email,
              password: hashedPassword,
              role: UserRole.TEACHER,
            });

            const savedUser = await manager.save(
              User,
              user,
            );

            // Create Teacher Profile
            const teacher = manager.create(
              Teacher,
              {
                employeeId:
                  createTeacherDto.employeeId,
                gender: createTeacherDto.gender,
                dateOfBirth: new Date(
                  createTeacherDto.dateOfBirth,
                ),
                phone: createTeacherDto.phone,
                qualification:
                  createTeacherDto.qualification,
                specialization:
                  createTeacherDto.specialization,
                hireDate: new Date(
                  createTeacherDto.hireDate,
                ),
                address:
                  createTeacherDto.address,
                profileImage:
                  createTeacherDto.profileImage,
                user: savedUser,
              },
            );

            const savedTeacher =
              await manager.save(
                Teacher,
                teacher,
              );

            return {
              ...savedTeacher,
              user: this.sanitizeUser(savedUser),
            };
          },
        );

      return {
        message:
          'Teacher created successfully.',
        data: teacher,
      };
    } catch (error) {
      this.logger.error(
        'Failed to create teacher.',
        error.stack,
      );

      throw new InternalServerErrorException(
        'Failed to create teacher.',
      );
    }
  }

  // =====================================================
  // Remaining CRUD Methods
  // =====================================================

  async findAll() {
    // Next implementation
  }

  async findOne(id: number) {
    // Next implementation
  }

  async update(
    id: number,
    updateTeacherDto: UpdateTeacherDto,
  ) {
    // Next implementation
  }

  async remove(id: number) {
    // Next implementation
  }
}

