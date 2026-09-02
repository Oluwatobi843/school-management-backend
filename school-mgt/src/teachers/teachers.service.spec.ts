import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TeachersService } from './teachers.service';
import { Teacher } from './entities/teacher.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { User, UserRole } from '../auth/entities/user.entity';

jest.mock('bcrypt');
import * as bcrypt from 'bcrypt';

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('TeachersService', () => {
  let service: TeachersService;
  let teacherRepo: {
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
    softDelete: jest.Mock;
    findByIds: jest.Mock;
    save: jest.Mock;
  };
  let userRepo: { findOne: jest.Mock };
  let subjectRepo: { findByIds: jest.Mock };
  let dataSource: { transaction: jest.Mock };

  const manager = {
    create: jest.fn((_e: unknown, data: unknown) => data),
    save: jest.fn((_e: unknown, data: unknown) => Promise.resolve(data)),
    findOne: jest.fn(),
  };

  const user = {
    id: 1,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    role: UserRole.TEACHER,
  } as unknown as User;

  const teacher = {
    id: 1,
    employeeId: 'T-001',
    user,
    subjects: [],
  } as unknown as Teacher;

  const createDto = {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    password: 'password123',
    employeeId: 'T-001',
    gender: 'Female',
    dateOfBirth: '1990-01-01',
    phone: '08012345678',
    qualification: 'BSc',
    specialization: 'Math',
    hireDate: '2020-01-01',
    address: 'Lagos',
  };

  beforeEach(async () => {
    mockedBcrypt.hash.mockReset();
    mockedBcrypt.compare.mockReset();

    teacherRepo = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      softDelete: jest.fn(),
      findByIds: jest.fn(),
      save: jest.fn(),
    };
    userRepo = { findOne: jest.fn() };
    subjectRepo = { findByIds: jest.fn() };
    dataSource = {
      transaction: jest.fn((cb: (m: unknown) => unknown) => cb(manager)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachersService,
        { provide: getRepositoryToken(Teacher), useValue: teacherRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Subject), useValue: subjectRepo },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<TeachersService>(TeachersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException when email exists', async () => {
      userRepo.findOne.mockResolvedValue(user);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException when employee id exists', async () => {
      userRepo.findOne.mockResolvedValue(null);
      teacherRepo.findOne.mockResolvedValue(teacher);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create teacher and return sanitized user', async () => {
      userRepo.findOne.mockResolvedValue(null);
      teacherRepo.findOne.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashed');

      const result = await service.create(createDto);

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(result.message).toBe('Teacher created successfully.');
      expect(result.data.user).not.toHaveProperty('password');
    });

    it('should throw InternalServerErrorException when transaction fails', async () => {
      userRepo.findOne.mockResolvedValue(null);
      teacherRepo.findOne.mockResolvedValue(null);
      dataSource.transaction.mockRejectedValue(new Error('db down'));

      await expect(service.create(createDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated teachers via query builder', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[teacher], 1]),
      };
      teacherRepo.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(teacherRepo.createQueryBuilder).toHaveBeenCalled();
      expect(queryBuilder.getManyAndCount).toHaveBeenCalled();
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when not found', async () => {
      teacherRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should return teacher with sanitized user', async () => {
      teacherRepo.findOne.mockResolvedValue(teacher);

      const result = await service.findOne(1);

      expect(result.data).not.toHaveProperty('password');
      expect(result.data.user).not.toHaveProperty('password');
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when not found', async () => {
      teacherRepo.findOne.mockResolvedValue(null);

      await expect(service.update(1, { firstName: 'John' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException when email taken', async () => {
      teacherRepo.findOne.mockResolvedValue(teacher);
      manager.findOne.mockResolvedValue({ ...user, id: 99 });

      await expect(
        service.update(1, { email: 'taken@example.com' }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should update teacher when email belongs to same user', async () => {
      teacherRepo.findOne.mockResolvedValue(teacher);
      manager.findOne.mockResolvedValue(user);
      manager.save.mockResolvedValue(teacher);

      const result = await service.update(1, {
        firstName: 'John',
        email: 'jane@example.com',
      });

      expect(result.message).toBe('Teacher updated successfully.');
      expect(result.data.user).not.toHaveProperty('password');
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException when not found', async () => {
      teacherRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

    it('should soft delete teacher', async () => {
      teacherRepo.findOne.mockResolvedValue(teacher);

      const result = await service.remove(1);

      expect(teacherRepo.softDelete).toHaveBeenCalledWith(1);
      expect(result.message).toBe('Teacher deleted successfully.');
    });
  });

  describe('assignSubjects', () => {
    it('should throw NotFoundException when teacher not found', async () => {
      teacherRepo.findOne.mockResolvedValue(null);

      await expect(service.assignSubjects(1, [1])).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when some subjects missing', async () => {
      teacherRepo.findOne.mockResolvedValue(teacher);
      subjectRepo.findByIds.mockResolvedValue([{ id: 1 }]);

      await expect(service.assignSubjects(1, [1, 2])).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should assign subjects to teacher', async () => {
      teacherRepo.findOne.mockResolvedValue(teacher);
      subjectRepo.findByIds.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      teacherRepo.save.mockResolvedValue(teacher);

      const result = await service.assignSubjects(1, [1, 2]);

      expect(teacher.subjects).toEqual([{ id: 1 }, { id: 2 }]);
      expect(result.message).toBe('Subjects assigned successfully.');
    });
  });
});
