import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @Length(2, 20)
  code!: string;

  @IsString()
  @Length(2, 100)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(5, 500)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isCore?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}