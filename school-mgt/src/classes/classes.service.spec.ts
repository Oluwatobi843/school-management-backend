import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { Class, ClassLevel } from './entities/class.entity';

describe('ClassesService', () => {
  let service: ClassesService;
  let classRepo: {
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    softDelete: jest.Mock;
  };

  const classEntity = {
    id: 1,
    name: 'Grade 5',
    level: ClassLevel.PRIMARY,
    section: 'A',
    capacity: 30,
  } as unknown as Class;

  const createDto = {
    name: 'Grade 5',
    level: ClassLevel.PRIMARY,
    section: 'A',
    capacity: 30,
  };

  beforeEach(async () => {
    classRepo = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        { provide: getRepositoryToken(Class), useValue: classRepo },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException when name exists', async () => {
      classRepo.findOne.mockResolvedValue(classEntity);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create a class', async () => {
      classRepo.findOne.mockResolvedValue(null);
      classRepo.create.mockReturnValue(classEntity);
      classRepo.save.mockResolvedValue(classEntity);

      const result = await service.create(createDto);

      expect(classRepo.create).toHaveBeenCalledWith(createDto);
      expect(result.message).toBe('Class created successfully.');
    });

    it('should throw InternalServerErrorException on save failure', async () => {
      classRepo.findOne.mockResolvedValue(null);
      classRepo.create.mockReturnValue(classEntity);
      classRepo.save.mockRejectedValue(new Error('db down'));

      await expect(service.create(createDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated classes via query builder', async () => {
      const queryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[classEntity], 1]),
      };
      classRepo.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(classRepo.createQueryBuilder).toHaveBeenCalled();
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when not found', async () => {
      classRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should return the class', async () => {
      classRepo.findOne.mockResolvedValue(classEntity);

      const result = await service.findOne(1);

      expect(result.data).toEqual(classEntity);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when not found', async () => {
      classRepo.findOne.mockResolvedValue(null);

      await expect(service.update(1, { name: 'New' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when new name taken', async () => {
      classRepo.findOne
        .mockResolvedValueOnce(classEntity) // current class
        .mockResolvedValueOnce({ ...classEntity, id: 2 }); // existing name
      classRepo.save.mockResolvedValue(classEntity);

      await expect(service.update(1, { name: 'Grade 6' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('should update and save the class', async () => {
      classRepo.findOne
        .mockResolvedValueOnce(classEntity)
        .mockResolvedValueOnce(null);
      classRepo.save.mockResolvedValue(classEntity);

      const result = await service.update(1, { name: 'Grade 5' });

      expect(classRepo.save).toHaveBeenCalled();
      expect(result.message).toBe('Class updated successfully.');
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException when not found', async () => {
      classRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

    it('should soft delete the class', async () => {
      classRepo.findOne.mockResolvedValue(classEntity);

      const result = await service.remove(1);

      expect(classRepo.softDelete).toHaveBeenCalledWith(1);
      expect(result.message).toBe('Class deleted successfully.');
    });
  });
});
