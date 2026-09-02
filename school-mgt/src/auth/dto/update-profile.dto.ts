import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'firstName must be a valid string' })
  @MinLength(3, { message: 'firstName must be at least 3 characters long' })
  @MaxLength(50, { message: 'firstName must not exceed 50 characters' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'lastName must be a valid string' })
  @MinLength(3, { message: 'lastName must be at least 3 characters long' })
  @MaxLength(50, { message: 'lastName must not exceed 50 characters' })
  lastName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;
}
