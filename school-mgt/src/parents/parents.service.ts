import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Parent } from './entities/parent.entity';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { QueryParentDto } from './dto/query-parent.dto';

@Injectable()
export class ParentsService {
  private readonly logger = new Logger(ParentsService.name);

  constructor(
    @InjectRepository(Parent)
    private readonly parentRepo: Repository<Parent>,
  ) {}

  
  // HELPER: CHECK EMAIL
  

  private async validateEmail(
    email: string,
    excludeId?: number,
  ): Promise<void> {
    const existingParent = await this.parentRepo.findOne({
      where: { email },
      withDeleted: false,
    });

    if (existingParent && existingParent.id !== excludeId) {
      throw new ConflictException(
        'A parent with this email already exists.',
      );
    }
  }

  
  // CREATE PARENT
  

  async create(dto: CreateParentDto) {
    await this.validateEmail(dto.email);

    try {
      const parent = this.parentRepo.create({
        ...dto,
        email: dto.email.toLowerCase(),
      });

      const savedParent = await this.parentRepo.save(parent);

      return {
        success: true,
        message: 'Parent created successfully.',
        data: savedParent,
      };
    } catch (error: unknown) {
      this.logger.error(
        'Failed to create parent.',
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'Failed to create parent.',
      );
    }
  }

  
  // GET ALL PARENTS
  

  async findAll(query: QueryParentDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const skip = (page - 1) * limit;

    const queryBuilder =
      this.parentRepo.createQueryBuilder('parent');

    if (query.search) {
      queryBuilder.andWhere(
        `(
          parent.firstName ILIKE :search
          OR parent.lastName ILIKE :search
          OR parent.email ILIKE :search
          OR parent.phoneNumber ILIKE :search
        )`,
        {
          search: `%${query.search}%`,
        },
      );
    }

    if (query.isActive !== undefined) {
      queryBuilder.andWhere(
        'parent.isActive = :isActive',   
        {
          isActive: query.isActive === 'true',
        },
      );
    }

    queryBuilder
      .orderBy('parent.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [parents, total] =
      await queryBuilder.getManyAndCount();

    return {
      success: true,
      message: 'Parents retrieved successfully.',
      data: parents,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  
  // GET PARENT BY ID
  

  async findOne(id: number) {
    const parent = await this.parentRepo.findOne({
      where: { id },
    });

    if (!parent) {
      throw new NotFoundException(
        `Parent with ID ${id} not found.`,
      );
    }

    return {
      success: true,
      message: 'Parent retrieved successfully.',
      data: parent,
    };
  }

 
  // UPDATE PARENT
  

  async update(
    id: number,
    dto: UpdateParentDto,
  ) {
    const parent = await this.parentRepo.findOne({
      where: { id },
    });

    if (!parent) {
      throw new NotFoundException(
        `Parent with ID ${id} not found.`,
      );
    }

    if (
      dto.email &&
      dto.email.toLowerCase() !== parent.email
    ) {
      await this.validateEmail(dto.email, id);
    }

    Object.assign(parent, {
      ...dto,
      email: dto.email
        ? dto.email.toLowerCase()
        : parent.email,
    });

    try {
      const updatedParent =
        await this.parentRepo.save(parent);

      return {
        success: true,
        message: 'Parent updated successfully.',
        data: updatedParent,
      };
    } catch (error: unknown) {
      this.logger.error(
        'Failed to update parent.',
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'Failed to update parent.',
      );
    }
  }

  
  // DELETE PARENT
  

  async remove(id: number) {
    const parent = await this.parentRepo.findOne({
      where: { id },
    });

    if (!parent) {
      throw new NotFoundException(
        `Parent with ID ${id} not found.`,
      );
    }

    try {
      await this.parentRepo.softDelete(id);

      return {
        success: true,
        message: 'Parent deleted successfully.',
      };
    } catch (error: unknown) {
      this.logger.error(
        'Failed to delete parent.',
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        'Failed to delete parent.',
      );
    }
  }
}