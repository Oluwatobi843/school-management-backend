import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Attendance } from './entities/attendance.entity';

import { Student } from '../student/entities/student.entity';
import { Class } from '../classes/entities/class.entity';
import { User, UserRole } from '../auth/entities/user.entity';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';

import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,

    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // CREATE ATTENDANCE

  async create(dto: CreateAttendanceDto, userId: number) {
    // Find the user recording attendance

    const recorder = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!recorder) {
      throw new UnauthorizedException('User not found');
    }

    // Only ADMIN and TEACHER can record attendance
    if (
      recorder.role !== UserRole.ADMIN &&
      recorder.role !== UserRole.TEACHER
    ) {
      throw new ForbiddenException(
        'Only administrators and teachers can record attendance',
      );
    }

    // Find student

    const student = await this.studentRepository.findOne({
      where: { id: dto.studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${dto.studentId} not found`);
    }

    // Find class

    const schoolClass = await this.classRepository.findOne({
      where: { id: dto.classId },
    });

    if (!schoolClass) {
      throw new NotFoundException(`Class with ID ${dto.classId} not found`);
    }

    // Verify student belongs to class

    if (!student.class) {
      throw new BadRequestException('Student is not assigned to a class');
    }

    if (student.class.id !== schoolClass.id) {
      throw new BadRequestException(
        'Student does not belong to the selected class',
      );
    }

    // Check duplicate attendance

    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        student: {
          id: student.id,
        },
        date: new Date(dto.date),
      },
    });

    if (existingAttendance) {
      throw new BadRequestException(
        'Attendance has already been recorded for this student on this date',
      );
    }

    // Create attendance

    const attendance = this.attendanceRepository.create({
      student,
      class: schoolClass,
      date: new Date(dto.date),
      status: dto.status,
      remark: dto.remark,
      recordedBy: recorder,
    });

    const savedAttendance = await this.attendanceRepository.save(attendance);

    return {
      message: 'Attendance recorded successfully',
      data: savedAttendance,
    };
  }

  // GET ALL ATTENDANCE

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [attendance, total] = await this.attendanceRepository.findAndCount({
      skip,
      take: limit,
      order: {
        date: 'DESC',
        createdAt: 'DESC',
      },
    });

    return {
      message: 'Attendance fetched successfully',
      data: attendance,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // GET ATTENDANCE BY ID

  async findOne(id: number) {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }

    return {
      message: 'Attendance retrieved successfully',
      data: attendance,
    };
  }

  // GET STUDENT ATTENDANCE

  async findByStudent(studentId: number, currentUser: AuthenticatedUser) {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // STUDENT CAN ONLY VIEW THEIR OWN ATTENDANCE
    if (
      currentUser.role === UserRole.STUDENT &&
      student.user.id !== currentUser.id
    ) {
      throw new ForbiddenException(
        'You are not allowed to access this student attendance',
      );
    }

    const attendance = await this.attendanceRepository.find({
      where: {
        student: {
          id: studentId,
        },
      },
      order: {
        date: 'DESC',
      },
    });

    return {
      message: 'Student attendance fetched successfully',
      data: attendance,
    };
  }

  // GET CLASS ATTENDANCE

  async findByClass(classId: number) {
    const schoolClass = await this.classRepository.findOne({
      where: { id: classId },
    });

    if (!schoolClass) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    const attendance = await this.attendanceRepository.find({
      where: {
        class: {
          id: classId,
        },
      },
      order: {
        date: 'DESC',
      },
    });

    return {
      message: 'Class attendance fetched successfully',
      data: attendance,
    };
  }

  // UPDATE ATTENDANCE

  async update(id: number, dto: UpdateAttendanceDto) {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }

    // If student is changed

    if (dto.studentId !== undefined) {
      const student = await this.studentRepository.findOne({
        where: { id: dto.studentId },
      });

      if (!student) {
        throw new NotFoundException(
          `Student with ID ${dto.studentId} not found`,
        );
      }

      attendance.student = student;
    }

    // If class is changed

    if (dto.classId !== undefined) {
      const schoolClass = await this.classRepository.findOne({
        where: { id: dto.classId },
      });

      if (!schoolClass) {
        throw new NotFoundException(`Class with ID ${dto.classId} not found`);
      }

      attendance.class = schoolClass;
    }

    // Verify student belongs to class

    if (
      attendance.student.class &&
      attendance.class &&
      attendance.student.class.id !== attendance.class.id
    ) {
      throw new BadRequestException(
        'Student does not belong to the selected class',
      );
    }

    // Update fields

    if (dto.date !== undefined) {
      attendance.date = new Date(dto.date);
    }

    if (dto.status !== undefined) {
      attendance.status = dto.status;
    }

    if (dto.remark !== undefined) {
      attendance.remark = dto.remark;
    }

    const updatedAttendance = await this.attendanceRepository.save(attendance);

    return {
      message: 'Attendance updated successfully',
      data: updatedAttendance,
    };
  }

  // DELETE ATTENDANCE

  async remove(id: number) {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }

    await this.attendanceRepository.softDelete(id);

    return {
      message: 'Attendance deleted successfully',
    };
  }
}
