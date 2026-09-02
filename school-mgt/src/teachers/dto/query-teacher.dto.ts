import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { Gender } from '../entities/teacher.entity';

export class QueryTeacherDto {
  @IsOptional()
  @IsNumberString()
  page?: string = '1';

  @IsOptional()
  @IsNumberString()
  limit?: string = '10';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
}
