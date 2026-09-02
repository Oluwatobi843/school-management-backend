import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'firstName must be a string' })
  @IsNotEmpty({ message: 'firstName is required! Please provide firstName' })
  @MinLength(3, { message: 'firstName must at least 3 characters long' })
  @MaxLength(50, { message: 'FirstName must not be longer than 50 characters' })
  firstName!: string;

  @IsString({ message: 'lastName must be a string' })
  @IsNotEmpty({ message: 'lastName is required! Please provide lastName' })
  @MinLength(3, { message: 'lastName must at least 3 characters long' })
  @MaxLength(50, { message: 'lastName must not be longer than 50 characters' })
  lastName!: string;

  @IsEmail({}, { message: 'Please provide a valid email ' })
  email!: string;

  @IsNotEmpty({ message: 'Password is required! Please provide password' })
  @MinLength(10, { message: 'Password must be at least 10 characters long' })
  password!: string;
}
