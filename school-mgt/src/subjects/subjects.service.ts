import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Subject } from './entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { QuerySubjectDto } from './dto/query-subject.dto';

@Injectable()
export class SubjectsService {
  private readonly logger = new Logger(SubjectsService.name);

  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepo: Repository<Subject>,

    private readonly dataSource: DataSource,
  ) {}

  // Helper Methods

  private async validateCode(code: string): Promise<void> {
    const existing = await this.subjectRepo.findOne({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictException(
        'A subject with this code already exists.',
      );
    }
  }

  private async validateName(name: string): Promise<void> {
    const existing = await this.subjectRepo.findOne({
      where: { name },
    });

    if (existing) {
      throw new ConflictException(
        'A subject with this name already exists.',
      );
    }
  }

  // Create Subject

  async create(createSubjectDto: CreateSubjectDto) {
    await this.validateCode(createSubjectDto.code);
    await this.validateName(createSubjectDto.name);

    try {
      const subject = await this.dataSource.transaction(
        async (manager) => {
          const newSubject = manager.create(Subject, {
            code: createSubjectDto.code.toUpperCase(),
            name: createSubjectDto.name,
            description: createSubjectDto.description,
            isCore: createSubjectDto.isCore ?? false,
            isActive: createSubjectDto.isActive ?? true,
          });

          return await manager.save(Subject, newSubject);
        },
      );

      return {
        success: true,
        message: 'Subject created successfully.',
        data: subject,
      };
    } catch (error) {
      this.logger.error(
        'Failed to create subject.',
        error instanceof Error
          ? error.stack
          : String(error),
      );

      throw new InternalServerErrorException(
        'Failed to create subject.',
      );
    }
  }

  // Remaining CRUD Methods


// Get All Subjects

async findAll(query: QuerySubjectDto) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const queryBuilder = this.subjectRepo.createQueryBuilder('subject');

  if (query.search) {
    queryBuilder.andWhere(
      `(subject.code ILIKE :search
        OR subject.name ILIKE :search)`,
      {
        search: `%${query.search}%`,
      },
    );
  }

  if (query.isCore !== undefined) {
    queryBuilder.andWhere(
      'subject.isCore = :isCore',
      {
        isCore: query.isCore === 'true',
      },
    );
  }

  if (query.isActive !== undefined) {
    queryBuilder.andWhere(
      'subject.isActive = :isActive',
      {
        isActive: query.isActive === 'true',
      },
    );
  }

  queryBuilder
    .orderBy('subject.createdAt', 'DESC')
    .skip(skip)
    .take(limit);

  const [subjects, total] =
    await queryBuilder.getManyAndCount();

  return {
    success: true,
    message: 'Subjects retrieved successfully.',
    data: subjects,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}


// Get Subject By ID

async findOne(id: number) {
  const subject = await this.subjectRepo.findOne({
    where: { id },
  });

  if (!subject) {
    throw new NotFoundException(
      `Subject with ID ${id} not found.`,
    );
  }

  return {
    success: true,
    message: 'Subject retrieved successfully.',
    data: subject,
  };
}


// Update Subject

async update(
  id: number,
  dto: UpdateSubjectDto,
) {
  const subject = await this.subjectRepo.findOne({
    where: { id },
  });

  if (!subject) {
    throw new NotFoundException(
      `Subject with ID ${id} not found.`,
    );
  }

  if (
    dto.code &&
    dto.code.toUpperCase() !== subject.code
  ) {
    await this.validateCode(dto.code);
  }

  if (
    dto.name &&
    dto.name !== subject.name
  ) {
    await this.validateName(dto.name);
  }

  Object.assign(subject, {
    ...dto,
    code: dto.code
      ? dto.code.toUpperCase()
      : subject.code,
  });

  try {
    const updated =
      await this.subjectRepo.save(subject);

    return {
      success: true,
      message:
        'Subject updated successfully.',
      data: updated,
    };
  } catch (error) {
    this.logger.error(
      'Failed to update subject.',
      error instanceof Error
        ? error.stack
        : String(error),
    );

    throw new InternalServerErrorException(
      'Failed to update subject.',
    );
  }
}

// Delete Subject

async remove(id: number) {
  const subject = await this.subjectRepo.findOne({
    where: { id },
  });

  if (!subject) {
    throw new NotFoundException(
      `Subject with ID ${id} not found.`,
    );
  }

  try {
    await this.subjectRepo.softRemove(subject);

    return {
      success: true,
      message:
        'Subject deleted successfully.',
    };
  } catch (error) {
    this.logger.error(
      'Failed to delete subject.',
      error instanceof Error
        ? error.stack
        : String(error),
    );

    throw new InternalServerErrorException(
      'Failed to delete subject.',
    );
  }
}
}