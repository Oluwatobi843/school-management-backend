import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @Length(3, 20)
  employeeId!: string;

  @IsString()
  @Length(2, 50)
  firstName!: string;

  @IsString()
  @Length(2, 50)
  lastName!: string;

  @IsString()
  gender!: string;

  @IsDateString()
  dateOfBirth!: Date;

  @IsOptional()
@IsString()
profileImage?: string;

  @IsEmail()
  email!: string;

  @IsPhoneNumber('NG')
  phoneNumber!: string;

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
  hireDate!: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}