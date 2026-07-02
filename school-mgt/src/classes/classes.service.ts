import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Class } from './entities/class.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { QueryClassDto } from './dto/query-class.dto';

@Injectable()
export class ClassesService {
  private readonly logger = new Logger(ClassesService.name);

  constructor(
    @InjectRepository(Class)
    private readonly classRepo: Repository<Class>,
  ) {}


  // Helper Methods
 

  private async validateClassName(name: string): Promise<void> {
    const existing = await this.classRepo.findOne({
      where: { name },
    });

    if (existing) {
      throw new ConflictException(
        'A class with this name already exists.',
      );
    }
  }

 
// Create Class


async create(createClassDto: CreateClassDto) {
  await this.validateClassName(createClassDto.name);

  try {
    const newClass = this.classRepo.create(createClassDto);

    const savedClass = await this.classRepo.save(newClass);

    return {
      success: true,
      message: 'Class created successfully.',
      data: savedClass,
    };
  } catch (error: unknown) {
    this.logger.error(
      'Failed to create class.',
      error instanceof Error ? error.stack : String(error),
    );

    throw new InternalServerErrorException(
      'Failed to create class.',
    );
  }
}


// Get All Classes


async findAll(query: QueryClassDto) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const queryBuilder =
    this.classRepo.createQueryBuilder('class');

  if (query.search) {
    queryBuilder.andWhere(
      '(class.name ILIKE :search OR class.description ILIKE :search)',
      {
        search: `%${query.search}%`,
      },
    );
  }

  if (query.level) {
    queryBuilder.andWhere(
      'class.level = :level',
      {
        level: query.level,
      },
    );
  }

  if (query.isActive !== undefined) {
    queryBuilder.andWhere(
      'class.isActive = :isActive',
      {
        isActive: query.isActive === 'true',
      },
    );
  }

  queryBuilder
    .orderBy('class.createdAt', 'DESC')
    .skip(skip)
    .take(limit);

  const [classes, total] =
    await queryBuilder.getManyAndCount();

  return {
    success: true,
    message: 'Classes retrieved successfully.',
    data: classes,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}


// Get Class By ID


async findOne(id: number) {
  const classEntity = await this.classRepo.findOne({
    where: { id },
  });

  if (!classEntity) {
    throw new NotFoundException(
      `Class with ID ${id} not found.`,
    );
  }

  return {
    success: true,
    message: 'Class retrieved successfully.',
    data: classEntity,
  };
}


// Update Class


async update(
  id: number,
  updateClassDto: UpdateClassDto,
) {
  const classEntity = await this.classRepo.findOne({
    where: { id },
  });

  if (!classEntity) {
    throw new NotFoundException(
      `Class with ID ${id} not found.`,
    );
  }

  if (
    updateClassDto.name &&
    updateClassDto.name !== classEntity.name
  ) {
    await this.validateClassName(
      updateClassDto.name,
    );
  }

  Object.assign(classEntity, updateClassDto);

  try {
    const updatedClass =
      await this.classRepo.save(classEntity);

    return {
      success: true,
      message: 'Class updated successfully.',
      data: updatedClass,
    };
  } catch (error: unknown) {
    this.logger.error(
      'Failed to update class.',
      error instanceof Error
        ? error.stack
        : String(error),
    );

    throw new InternalServerErrorException(
      'Failed to update class.',
    );
  }
}


// Delete Class


async remove(id: number) {
  const classEntity = await this.classRepo.findOne({
    where: { id },
  });

  if (!classEntity) {
    throw new NotFoundException(
      `Class with ID ${id} not found.`,
    );
  }

  try {
    await this.classRepo.softDelete(id);

    return {
      success: true,
      message: 'Class deleted successfully.',
    };
  } catch (error: unknown) {
    this.logger.error(
      'Failed to delete class.',
      error instanceof Error
        ? error.stack
        : String(error),
    );

    throw new InternalServerErrorException(
      'Failed to delete class.',
    );
  }
}

}