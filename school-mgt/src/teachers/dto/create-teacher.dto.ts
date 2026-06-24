import {
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

  @IsString()
  @Length(2, 55)
  firstName!: string;

  @IsString()
  @Length(2, 50)
  lastName!: string;

  @IsEnum(Gender)
  gender!: Gender;

  @IsDateString()
  dateOfBirth!: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsEmail()
  email!: string;

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
}