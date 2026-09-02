import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { QueryTeacherDto } from './dto/query-teacher.dto';
import * as bcrypt from 'bcrypt';

import { Teacher } from './entities/teacher.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { User, UserRole } from '../auth/entities/user.entity';
import { Subject } from '../subjects/entities/subject.entity';

@Injectable()
export class TeachersService {
  private readonly logger = new Logger(TeachersService.name);

  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepo: Repository<Teacher>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Subject)
    private readonly subjectRepo: Repository<Subject>,

    private readonly dataSource: DataSource,
  ) {}

  // Helper Methods

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private sanitizeUser(user: User) {
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }

  private async validateEmail(email: string): Promise<void> {
    const existingUser = await this.userRepo.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists.');
    }
  }

  private async validateEmployeeId(employeeId: string): Promise<void> {
    const existingTeacher = await this.teacherRepo.findOne({
      where: { employeeId },
    });

    if (existingTeacher) {
      throw new ConflictException(
        'A teacher with this employee ID already exists.',
      );
    }
  }

  // Create Teacher

  async create(createTeacherDto: CreateTeacherDto) {
    await this.validateEmail(createTeacherDto.email);
    await this.validateEmployeeId(createTeacherDto.employeeId);

    try {
      const teacher = await this.dataSource.transaction(async (manager) => {
        // Hash Password
        const hashedPassword = await this.hashPassword(
          createTeacherDto.password,
        );

        // Create User
        const user = manager.create(User, {
          firstName: createTeacherDto.firstName,
          lastName: createTeacherDto.lastName,
          email: createTeacherDto.email,
          password: hashedPassword,
          role: UserRole.TEACHER,
        });

        const savedUser = await manager.save(User, user);

        // Create Teacher Profile
        const teacher = manager.create(Teacher, {
          employeeId: createTeacherDto.employeeId,
          gender: createTeacherDto.gender,
          dateOfBirth: new Date(createTeacherDto.dateOfBirth),
          phone: createTeacherDto.phone,
          qualification: createTeacherDto.qualification,
          specialization: createTeacherDto.specialization,
          hireDate: new Date(createTeacherDto.hireDate),
          address: createTeacherDto.address,
          profileImage: createTeacherDto.profileImage,
          user: savedUser,
        });

        const savedTeacher = await manager.save(Teacher, teacher);

        return {
          ...savedTeacher,
          user: this.sanitizeUser(savedUser),
        };
      });

      return {
        message: 'Teacher created successfully.',
        data: teacher,
      };
    } catch (error) {
      this.logger.error(
        'Failed to create teacher.',
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException('Failed to create teacher.');
    }
  }

  async findAll(query: QueryTeacherDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.teacherRepo
      .createQueryBuilder('teacher')
      .leftJoinAndSelect('teacher.user', 'user');

    if (query.search) {
      queryBuilder.andWhere(
        `(teacher.employeeId ILIKE :search
        OR user.firstName ILIKE :search
        OR user.lastName ILIKE :search
        OR user.email ILIKE :search)`,
        {
          search: `%${query.search}%`,
        },
      );
    }

    if (query.specialization) {
      queryBuilder.andWhere('teacher.specialization = :specialization', {
        specialization: query.specialization,
      });
    }

    if (query.gender) {
      queryBuilder.andWhere('teacher.gender = :gender', {
        gender: query.gender,
      });
    }

    queryBuilder.orderBy('teacher.createdAt', 'DESC').skip(skip).take(limit);

    const [teachers, total] = await queryBuilder.getManyAndCount();

    return {
      success: true,
      message: 'Teachers retrieved successfully.',
      data: teachers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get Teacher By ID

  async findOne(id: number) {
    const teacher = await this.teacherRepo.findOne({
      where: { id },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found.`);
    }

    return {
      success: true,
      message: 'Teacher retrieved successfully.',
      data: {
        ...teacher,
        user: this.sanitizeUser(teacher.user),
      },
    };
  }

  // Update Teacher

  async update(id: number, dto: UpdateTeacherDto) {
    const teacher = await this.teacherRepo.findOne({
      where: { id },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found.`);
    }

    try {
      const updatedTeacher = await this.dataSource.transaction(
        async (manager) => {
          // Update User

          if (dto.firstName) {
            teacher.user.firstName = dto.firstName;
          }

          if (dto.lastName) {
            teacher.user.lastName = dto.lastName;
          }

          if (dto.email) {
            const existingUser = await manager.findOne(User, {
              where: {
                email: dto.email,
              },
            });

            if (existingUser && existingUser.id !== teacher.user.id) {
              throw new ConflictException(
                'A user with this email already exists.',
              );
            }

            teacher.user.email = dto.email;
          }

          if (dto.password) {
            teacher.user.password = await this.hashPassword(dto.password);
          }

          await manager.save(User, teacher.user);

          // Update Teacher

          if (dto.employeeId) {
            teacher.employeeId = dto.employeeId;
          }

          if (dto.gender) {
            teacher.gender = dto.gender;
          }

          if (dto.dateOfBirth) {
            teacher.dateOfBirth = new Date(dto.dateOfBirth);
          }

          if (dto.phone !== undefined) {
            teacher.phone = dto.phone;
          }

          if (dto.address !== undefined) {
            teacher.address = dto.address;
          }

          if (dto.qualification) {
            teacher.qualification = dto.qualification;
          }

          if (dto.specialization) {
            teacher.specialization = dto.specialization;
          }

          if (dto.hireDate) {
            teacher.hireDate = new Date(dto.hireDate);
          }

          if (dto.profileImage !== undefined) {
            teacher.profileImage = dto.profileImage;
          }

          return await manager.save(Teacher, teacher);
        },
      );

      return {
        success: true,
        message: 'Teacher updated successfully.',
        data: {
          ...updatedTeacher,
          user: this.sanitizeUser(updatedTeacher.user),
        },
      };
    } catch (error) {
      this.logger.error(
        'Failed to update teacher.',
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException('Failed to update teacher.');
    }
  }

  async remove(id: number) {
    const teacher = await this.teacherRepo.findOne({
      where: { id },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found.`);
    }

    await this.teacherRepo.softDelete(id);

    return {
      success: true,
      message: 'Teacher deleted successfully.',
    };
  }

  // Assign Subjects to Teacher
  async assignSubjects(teacherId: number, subjectIds: number[]) {
    const teacher = await this.teacherRepo.findOne({
      where: { id: teacherId },
      relations: ['subjects'],
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found.`);
    }

    const subjects = await this.subjectRepo.findByIds(subjectIds);

    if (subjects.length !== subjectIds.length) {
      throw new NotFoundException('One or more subjects were not found.');
    }

    teacher.subjects = subjects;

    const updatedTeacher = await this.teacherRepo.save(teacher);

    return {
      success: true,
      message: 'Subjects assigned successfully.',
      data: updatedTeacher,
    };
  }
}
