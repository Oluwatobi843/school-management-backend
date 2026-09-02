import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { Attendance, AttendanceStatus } from './entities/attendance.entity';
import { Student } from '../student/entities/student.entity';
import { Class } from '../classes/entities/class.entity';
import { User, UserRole } from '../auth/entities/user.entity';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let attendanceRepository: {
    findOne: jest.Mock;
    findAndCount: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    softDelete: jest.Mock;
  };
  let studentRepository: { findOne: jest.Mock };
  let classRepository: { findOne: jest.Mock };
  let userRepository: { findOne: jest.Mock };

  const admin = {
    id: 1,
    role: UserRole.ADMIN,
  } as unknown as User;

  const schoolClass = {
    id: 10,
    name: 'Grade 5',
  } as unknown as Class;

  const student = {
    id: 100,
    user: { id: 1 },
    class: schoolClass,
  } as unknown as Student;

  const attendance = {
    id: 500,
    student,
    class: schoolClass,
    date: new Date('2026-01-01'),
    status: AttendanceStatus.PRESENT,
  } as unknown as Attendance;

  const createDto = {
    studentId: 100,
    classId: 10,
    date: '2026-01-01',
    status: AttendanceStatus.PRESENT,
  };

  beforeEach(async () => {
    attendanceRepository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn(),
    };
    studentRepository = { findOne: jest.fn() };
    classRepository = { findOne: jest.fn() };
    userRepository = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: getRepositoryToken(Attendance),
          useValue: attendanceRepository,
        },
        { provide: getRepositoryToken(Student), useValue: studentRepository },
        { provide: getRepositoryToken(Class), useValue: classRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw UnauthorizedException when recorder not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, 1)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw ForbiddenException for non-admin/teacher', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 3,
        role: UserRole.STUDENT,
      });

      await expect(service.create(createDto, 3)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when student not found', async () => {
      userRepository.findOne.mockResolvedValue(admin);
      studentRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when class not found', async () => {
      userRepository.findOne.mockResolvedValue(admin);
      studentRepository.findOne.mockResolvedValue(student);
      classRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when student not in class', async () => {
      userRepository.findOne.mockResolvedValue(admin);
      studentRepository.findOne.mockResolvedValue(student);
      classRepository.findOne.mockResolvedValue({ ...schoolClass, id: 99 });

      await expect(service.create(createDto, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException on duplicate attendance', async () => {
      userRepository.findOne.mockResolvedValue(admin);
      studentRepository.findOne.mockResolvedValue(student);
      classRepository.findOne.mockResolvedValue(schoolClass);
      attendanceRepository.findOne.mockResolvedValue(attendance);

      await expect(service.create(createDto, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create attendance', async () => {
      userRepository.findOne.mockResolvedValue(admin);
      studentRepository.findOne.mockResolvedValue(student);
      classRepository.findOne.mockResolvedValue(schoolClass);
      attendanceRepository.findOne.mockResolvedValue(null);
      attendanceRepository.create.mockReturnValue(attendance);
      attendanceRepository.save.mockResolvedValue(attendance);

      const result = await service.create(createDto, 1);

      expect(attendanceRepository.create).toHaveBeenCalled();
      expect(result.message).toBe('Attendance recorded successfully');
    });
  });

  describe('findAll', () => {
    it('should return paginated attendance', async () => {
      attendanceRepository.findAndCount.mockResolvedValue([[attendance], 1]);

      const result = await service.findAll(1, 10);

      expect(result.data).toEqual([attendance]);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when not found', async () => {
      attendanceRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(500)).rejects.toThrow(NotFoundException);
    });

    it('should return attendance', async () => {
      attendanceRepository.findOne.mockResolvedValue(attendance);

      const result = await service.findOne(500);

      expect(result.data).toEqual(attendance);
    });
  });

  describe('findByStudent', () => {
    it('should throw NotFoundException when student not found', async () => {
      studentRepository.findOne.mockResolvedValue(null);

      await expect(service.findByStudent(100, {} as never)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should forbid a student viewing another student attendance', async () => {
      studentRepository.findOne.mockResolvedValue(student);

      await expect(
        service.findByStudent(100, {
          id: 999,
          role: UserRole.STUDENT,
        } as never),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return attendance for admins', async () => {
      studentRepository.findOne.mockResolvedValue(student);
      attendanceRepository.find.mockResolvedValue([attendance]);

      const result = await service.findByStudent(100, {
        id: 999,
        role: UserRole.ADMIN,
      } as never);

      expect(result.data).toEqual([attendance]);
    });
  });

  describe('findByClass', () => {
    it('should throw NotFoundException when class not found', async () => {
      classRepository.findOne.mockResolvedValue(null);

      await expect(service.findByClass(10)).rejects.toThrow(NotFoundException);
    });

    it('should return attendance for class', async () => {
      classRepository.findOne.mockResolvedValue(schoolClass);
      attendanceRepository.find.mockResolvedValue([attendance]);

      const result = await service.findByClass(10);

      expect(result.data).toEqual([attendance]);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when not found', async () => {
      attendanceRepository.findOne.mockResolvedValue(null);

      await expect(service.update(500, { status: 'ABSENT' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when new student not found', async () => {
      attendanceRepository.findOne.mockResolvedValue(attendance);
      studentRepository.findOne.mockResolvedValue(null);

      await expect(service.update(500, { studentId: 999 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update and save attendance', async () => {
      attendanceRepository.findOne.mockResolvedValue(attendance);
      attendanceRepository.save.mockResolvedValue(attendance);

      const result = await service.update(500, {
        status: 'ABSENT',
        remark: 'Sick',
      });

      expect(attendanceRepository.save).toHaveBeenCalled();
      expect(result.message).toBe('Attendance updated successfully');
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException when not found', async () => {
      attendanceRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(500)).rejects.toThrow(NotFoundException);
    });

    it('should soft delete attendance', async () => {
      attendanceRepository.findOne.mockResolvedValue(attendance);

      const result = await service.remove(500);

      expect(attendanceRepository.softDelete).toHaveBeenCalledWith(500);
      expect(result.message).toBe('Attendance deleted successfully');
    });
  });
});
