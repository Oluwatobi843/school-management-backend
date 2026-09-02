import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { StudentService } from './student.service';
import { Student } from './entities/student.entity';
import { Class } from '../classes/entities/class.entity';
import { User, UserRole } from '../auth/entities/user.entity';

jest.mock('bcrypt');
import * as bcrypt from 'bcrypt';

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('StudentService', () => {
  let service: StudentService;
  let studentRepository: {
    findOne: jest.Mock;
    findAndCount: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    softDelete: jest.Mock;
  };
  let userRepository: { findOne: jest.Mock };
  let classRepository: { findOne: jest.Mock };
  let dataSource: { transaction: jest.Mock };

  const adminUser = {
    id: 1,
    role: UserRole.ADMIN,
  } as unknown as User;

  const schoolClass = {
    id: 10,
    name: 'Grade 5',
  } as unknown as Class;

  const student = {
    id: 100,
    admissionNumber: 'ADM-001',
    user: { id: 1 },
    class: schoolClass,
  } as unknown as Student;

  const createDto = {
    admissionNumber: 'ADM-001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password123',
    gender: 'Male',
    dateOfBirth: new Date('2010-01-01'),
    classId: 10,
  };

  beforeEach(async () => {
    mockedBcrypt.hash.mockReset();
    mockedBcrypt.compare.mockReset();

    studentRepository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn(),
    };
    userRepository = { findOne: jest.fn() };
    classRepository = { findOne: jest.fn() };
    dataSource = {
      transaction: jest.fn((cb: (manager: any) => Promise<unknown>) =>
        cb({
          create: jest.fn((_entity: unknown, data: unknown) => data),
          save: jest.fn((_entity: unknown, data: unknown) =>
            Promise.resolve(data),
          ),
        }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
        { provide: getRepositoryToken(Student), useValue: studentRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(Class), useValue: classRepository },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<StudentService>(StudentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException when admin not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when email already exists', async () => {
      userRepository.findOne
        .mockResolvedValueOnce(adminUser) // admin
        .mockResolvedValueOnce(adminUser); // email exists
      studentRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when admission number exists', async () => {
      userRepository.findOne
        .mockResolvedValueOnce(adminUser) // admin
        .mockResolvedValueOnce(null); // email free
      studentRepository.findOne.mockResolvedValue(student);

      await expect(service.create(createDto, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when class not found', async () => {
      userRepository.findOne
        .mockResolvedValueOnce(adminUser) // admin
        .mockResolvedValueOnce(null); // email free
      studentRepository.findOne.mockResolvedValue(null);
      classRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should create student within a transaction', async () => {
      userRepository.findOne
        .mockResolvedValueOnce(adminUser) // admin
        .mockResolvedValueOnce(null); // email free
      studentRepository.findOne.mockResolvedValue(null);
      classRepository.findOne.mockResolvedValue(schoolClass);
      mockedBcrypt.hash.mockResolvedValue('hashed');

      const result = await service.create(createDto, 1);

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(result.message).toBe('Student created successfully');
    });
  });

  describe('findAll', () => {
    it('should return paginated students', async () => {
      studentRepository.findAndCount.mockResolvedValue([[student], 1]);

      const result = await service.findAll(1, 10);

      expect(result.data).toEqual([student]);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe('findByAdmissionNumber', () => {
    it('should throw NotFoundException when not found', async () => {
      studentRepository.findOne.mockResolvedValue(null);

      await expect(service.findByAdmissionNumber('ADM-001')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return the student', async () => {
      studentRepository.findOne.mockResolvedValue(student);

      const result = await service.findByAdmissionNumber('ADM-001');

      expect(result.data).toEqual(student);
    });
  });

  describe('findOne', () => {
    const currentUser = {
      id: 1,
      role: UserRole.ADMIN,
    } as unknown as Parameters<typeof service.findOne>[1];

    it('should throw NotFoundException when not found', async () => {
      studentRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(100, currentUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should forbid a student viewing another profile', async () => {
      studentRepository.findOne.mockResolvedValue(student);

      await expect(
        service.findOne(100, {
          id: 999,
          role: UserRole.STUDENT,
        } as unknown as Parameters<typeof service.findOne>[1]),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return the student', async () => {
      studentRepository.findOne.mockResolvedValue(student);

      const result = await service.findOne(100, currentUser);

      expect(result.data).toEqual(student);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when student not found', async () => {
      studentRepository.findOne.mockResolvedValue(null);

      await expect(service.update(100, { firstName: 'New' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when class not found', async () => {
      studentRepository.findOne.mockResolvedValue(student);
      classRepository.findOne.mockResolvedValue(null);

      await expect(service.update(100, { classId: 999 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update the student', async () => {
      studentRepository.findOne.mockResolvedValue(student);
      studentRepository.save.mockResolvedValue(student);

      const result = await service.update(100, { firstName: 'New' });

      expect(studentRepository.save).toHaveBeenCalled();
      expect(result.message).toBe('Student updated successfully');
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException when not found', async () => {
      studentRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(100)).rejects.toThrow(NotFoundException);
    });

    it('should soft delete the student', async () => {
      studentRepository.findOne.mockResolvedValue(student);

      const result = await service.remove(100);

      expect(studentRepository.softDelete).toHaveBeenCalledWith(100);
      expect(result.message).toBe('Student deleted successfully');
    });
  });
});
