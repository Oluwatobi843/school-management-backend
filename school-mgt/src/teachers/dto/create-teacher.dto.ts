import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';
import { Gender } from '../entities/teacher.entity';

export class CreateTeacherDto {
  @IsString()
  @Length(3, 55)
  employeeId!: string;


  @IsEnum(Gender)
  gender!: Gender;

  @IsDateString()
  dateOfBirth!: string;

  @IsOptional()
  @IsString()
  profileImage?: string;


  @IsOptional()
  @IsPhoneNumber('NG')
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  qualification?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsDateString()
  hireDate!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}