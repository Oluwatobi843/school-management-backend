import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ParentsService } from './parents.service';
import { Parent } from './entities/parent.entity';
import { ParentStudent } from './entities/parent-student.entity';
import { Student } from '../student/entities/student.entity';

describe('ParentsService', () => {
  let service: ParentsService;
  let parentRepo: {
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    softDelete: jest.Mock;
  };
  let parentStudentRepo: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };
  let studentRepo: { findOne: jest.Mock };

  const parent = {
    id: 1,
    firstName: 'Mary',
    lastName: 'Jones',
    email: 'mary@example.com',
    phoneNumber: '08012345678',
    isActive: true,
  } as unknown as Parent;

  const student = {
    id: 5,
    admissionNumber: 'ADM-005',
  } as unknown as Student;

  const relationship = {
    id: 11,
    relationship: 'Father',
    parent,
    student,
  } as unknown as ParentStudent;

  const createDto = {
    firstName: 'Mary',
    lastName: 'Jones',
    email: 'MARY@example.com',
    phoneNumber: '08012345678',
  };

  beforeEach(async () => {
    parentRepo = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn(),
    };
    parentStudentRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    studentRepo = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParentsService,
        { provide: getRepositoryToken(Parent), useValue: parentRepo },
        {
          provide: getRepositoryToken(ParentStudent),
          useValue: parentStudentRepo,
        },
        { provide: getRepositoryToken(Student), useValue: studentRepo },
      ],
    }).compile();

    service = module.get<ParentsService>(ParentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException when email exists', async () => {
      parentRepo.findOne.mockResolvedValue(parent);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create parent with lowercased email', async () => {
      parentRepo.findOne.mockResolvedValue(null);
      parentRepo.create.mockReturnValue(parent);
      parentRepo.save.mockResolvedValue(parent);

      const result = await service.create(createDto);

      expect(parentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'mary@example.com' }),
      );
      expect(result.message).toBe('Parent created successfully.');
    });

    it('should throw InternalServerErrorException on save failure', async () => {
      parentRepo.findOne.mockResolvedValue(null);
      parentRepo.create.mockReturnValue(parent);
      parentRepo.save.mockRejectedValue(new Error('db down'));

      await expect(service.create(createDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated parents via query builder', async () => {
      const queryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[parent], 1]),
      };
      parentRepo.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(parentRepo.createQueryBuilder).toHaveBeenCalled();
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when not found', async () => {
      parentRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should return the parent', async () => {
      parentRepo.findOne.mockResolvedValue(parent);

      const result = await service.findOne(1);

      expect(result.data).toEqual(parent);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when not found', async () => {
      parentRepo.findOne.mockResolvedValue(null);

      await expect(service.update(1, { firstName: 'Zoe' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when email taken', async () => {
      parentRepo.findOne
        .mockResolvedValueOnce(parent) // current parent (id 1)
        .mockResolvedValueOnce({ ...parent, id: 2 }); // another parent already has email
      parentRepo.save.mockResolvedValue(parent);

      await expect(
        service.update(1, { email: 'taken@example.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should update and save the parent', async () => {
      parentRepo.findOne
        .mockResolvedValueOnce(parent)
        .mockResolvedValueOnce(null);
      parentRepo.save.mockResolvedValue(parent);

      const result = await service.update(1, { firstName: 'Zoe' });

      expect(parentRepo.save).toHaveBeenCalled();
      expect(result.message).toBe('Parent updated successfully.');
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException when not found', async () => {
      parentRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

    it('should soft delete parent', async () => {
      parentRepo.findOne.mockResolvedValue(parent);

      const result = await service.remove(1);

      expect(parentRepo.softDelete).toHaveBeenCalledWith(1);
      expect(result.message).toBe('Parent deleted successfully.');
    });
  });

  describe('getStudents', () => {
    it('should throw NotFoundException when parent not found', async () => {
      parentRepo.findOne.mockResolvedValue(null);

      await expect(service.getStudents(1)).rejects.toThrow(NotFoundException);
    });

    it('should return relationships', async () => {
      parentRepo.findOne.mockResolvedValue(parent);
      parentStudentRepo.find.mockResolvedValue([relationship]);

      const result = await service.getStudents(1);

      expect(result.data).toEqual([relationship]);
    });
  });

  describe('getStudentRelationship', () => {
    it('should throw NotFoundException when relationship missing', async () => {
      parentStudentRepo.findOne.mockResolvedValue(null);

      await expect(service.getStudentRelationship(1, 5)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return the relationship', async () => {
      parentStudentRepo.findOne.mockResolvedValue(relationship);

      const result = await service.getStudentRelationship(1, 5);

      expect(result.data).toEqual(relationship);
    });
  });

  describe('updateStudentRelationship', () => {
    it('should throw NotFoundException when relationship missing', async () => {
      parentStudentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateStudentRelationship(1, 5, { studentId: 5 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException on studentId mismatch', async () => {
      parentStudentRepo.findOne.mockResolvedValue(relationship);

      await expect(
        service.updateStudentRelationship(1, 5, { studentId: 99 }),
      ).rejects.toThrow(ConflictException);
    });

    it('should update relationship fields', async () => {
      parentStudentRepo.findOne.mockResolvedValue(relationship);
      parentStudentRepo.save.mockResolvedValue(relationship);

      const result = await service.updateStudentRelationship(1, 5, {
        studentId: 5,
        relationship: 'Mother',
        isPrimaryContact: true,
      });

      expect(relationship.relationship).toBe('Mother');
      expect(result.message).toBe(
        'Parent-student relationship updated successfully.',
      );
    });
  });

  describe('unlinkStudent', () => {
    it('should throw NotFoundException when relationship missing', async () => {
      parentStudentRepo.findOne.mockResolvedValue(null);

      await expect(service.unlinkStudent(1, 5)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should remove the relationship', async () => {
      parentStudentRepo.findOne.mockResolvedValue(relationship);

      const result = await service.unlinkStudent(1, 5);

      expect(parentStudentRepo.remove).toHaveBeenCalledWith(relationship);
      expect(result.message).toBe('Student unlinked from parent successfully.');
    });
  });

  describe('linkStudent', () => {
    it('should throw NotFoundException when parent not found', async () => {
      parentRepo.findOne.mockResolvedValue(null);

      await expect(service.linkStudent(1, { studentId: 5 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when student not found', async () => {
      parentRepo.findOne.mockResolvedValue(parent);
      studentRepo.findOne.mockResolvedValue(null);

      await expect(service.linkStudent(1, { studentId: 5 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when already linked', async () => {
      parentRepo.findOne.mockResolvedValue(parent);
      studentRepo.findOne.mockResolvedValue(student);
      parentStudentRepo.findOne.mockResolvedValue(relationship);

      await expect(service.linkStudent(1, { studentId: 5 })).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create and save relationship', async () => {
      parentRepo.findOne.mockResolvedValue(parent);
      studentRepo.findOne.mockResolvedValue(student);
      parentStudentRepo.findOne.mockResolvedValue(null);
      parentStudentRepo.create.mockReturnValue(relationship);
      parentStudentRepo.save.mockResolvedValue(relationship);

      const result = await service.linkStudent(1, { studentId: 5 });

      expect(parentStudentRepo.create).toHaveBeenCalled();
      expect(result.message).toBe('Parent linked to student successfully.');
    });
  });
});
