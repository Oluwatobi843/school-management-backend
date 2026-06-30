
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Gender } from '../entities/teacher.entity';

export class CreateTeacherDto {
  
  // User Information


  @IsString()
  @Length(2, 50)
  firstName!: string;

  @IsString()
  @Length(2, 50)
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Length(8, 100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
  })
  password!: string;


  // Teacher Information


  @IsString()
  @Length(3, 55)
  employeeId!: string;

  @IsEnum(Gender)
  gender!: Gender;

  @IsDateString()
  dateOfBirth!: string;

  @IsOptional()
  @IsPhoneNumber('NG')
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(5, 255)
  address?: string;

  @IsString()
  @Length(2, 100)
  qualification!: string;

  @IsString()
  @Length(2, 100)
  specialization!: string;

  @IsDateString()
  hireDate!: string;

  @IsOptional()
  @IsString()
  profileImage?: string;
}

