import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SubjectsService } from './subjects.service';
import { Subject } from './entities/subject.entity';

describe('SubjectsService', () => {
  let service: SubjectsService;
  let subjectRepo: {
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
    save: jest.Mock;
    softRemove: jest.Mock;
  };
  let dataSource: { transaction: jest.Mock };

  const manager = {
    create: jest.fn((_e: unknown, data: unknown) => data),
    save: jest.fn((_e: unknown, data: unknown) => Promise.resolve(data)),
  };

  const subject = {
    id: 1,
    code: 'MATH',
    name: 'Mathematics',
    isCore: true,
    isActive: true,
  } as unknown as Subject;

  const createDto = {
    code: 'math',
    name: 'Mathematics',
    isCore: true,
  };

  beforeEach(async () => {
    subjectRepo = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      save: jest.fn(),
      softRemove: jest.fn(),
    };
    dataSource = {
      transaction: jest.fn((cb: (m: unknown) => unknown) => cb(manager)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectsService,
        { provide: getRepositoryToken(Subject), useValue: subjectRepo },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<SubjectsService>(SubjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException when code exists', async () => {
      subjectRepo.findOne.mockResolvedValue(subject);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException when name exists', async () => {
      subjectRepo.findOne
        .mockResolvedValueOnce(null) // code
        .mockResolvedValueOnce(subject); // name

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create a subject uppercasing the code', async () => {
      subjectRepo.findOne.mockResolvedValue(null);
      manager.create.mockReturnValue(subject);

      const result = await service.create(createDto);

      expect(manager.create).toHaveBeenCalledWith(
        Subject,
        expect.objectContaining({ code: 'MATH' }),
      );
      expect(result.message).toBe('Subject created successfully.');
    });

    it('should throw InternalServerErrorException when transaction fails', async () => {
      subjectRepo.findOne.mockResolvedValue(null);
      dataSource.transaction.mockRejectedValue(new Error('db down'));

      await expect(service.create(createDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated subjects via query builder', async () => {
      const queryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[subject], 1]),
      };
      subjectRepo.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(subjectRepo.createQueryBuilder).toHaveBeenCalled();
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when not found', async () => {
      subjectRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should return the subject', async () => {
      subjectRepo.findOne.mockResolvedValue(subject);

      const result = await service.findOne(1);

      expect(result.data).toEqual(subject);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when not found', async () => {
      subjectRepo.findOne.mockResolvedValue(null);

      await expect(service.update(1, { name: 'New' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when new code taken', async () => {
      subjectRepo.findOne
        .mockResolvedValueOnce(subject) // current subject
        .mockResolvedValueOnce({ ...subject, id: 2 }); // existing code
      subjectRepo.save.mockResolvedValue(subject);

      await expect(service.update(1, { code: 'PHY' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('should update and save the subject', async () => {
      subjectRepo.findOne
        .mockResolvedValueOnce(subject)
        .mockResolvedValueOnce(null);
      subjectRepo.save.mockResolvedValue(subject);

      const result = await service.update(1, { name: 'Maths' });

      expect(subjectRepo.save).toHaveBeenCalled();
      expect(result.message).toBe('Subject updated successfully.');
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException when not found', async () => {
      subjectRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

    it('should soft remove the subject', async () => {
      subjectRepo.findOne.mockResolvedValue(subject);

      const result = await service.remove(1);

      expect(subjectRepo.softRemove).toHaveBeenCalledWith(subject);
      expect(result.message).toBe('Subject deleted successfully.');
    });
  });
});
