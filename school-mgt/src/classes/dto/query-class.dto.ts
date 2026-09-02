import { IsBooleanString, IsEnum, IsOptional, IsString } from 'class-validator';

import { ClassLevel } from '../entities/class.entity';

export class QueryClassDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ClassLevel)
  level?: ClassLevel;

  @IsOptional()
  @IsBooleanString()
  isActive?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
