import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

import { ClassLevel } from '../entities/class.entity';

export class CreateClassDto {
  @IsString()
  @Length(2, 50)
  name!: string;

  @IsEnum(ClassLevel)
  level!: ClassLevel;

  @IsString()
  @Length(1, 10)
  section!: string;

  @IsInt()
  @Min(1)
  @Max(100)
  capacity!: number;

  @IsOptional()
  @IsString()
  @Length(5, 255)
  description?: string;
}
