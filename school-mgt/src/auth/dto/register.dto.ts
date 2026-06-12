import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength, MinLength, minLength } from "class-validator";
import { UserRole } from "../entities/user.entity";


export class RegisterDto {
  @IsString({ message: 'firstName mustbe a string' })
  @IsNotEmpty({ message: 'firstName is required! Please provide firstName' })
  @MinLength(3, { message: 'firstName must at least 3 characters long' })
  @MaxLength(50, { message: 'FirstName must not be longer than 50 characters' })
  firstName!: string;

  @IsString({ message: 'lastName mustbe a string' })
  @IsNotEmpty({ message: 'lastName is required! Please provide firstName' })
  @MinLength(3, { message: 'lastName must at least 3 characters long' })
  @MaxLength(50, { message: 'lastName must not be longer than 50 characters' })
  lastName!: string;

  @IsEmail({},{message: 'Please provide a valid email '})
  email!: string;

  @IsNotEmpty({message: 'Password is required! Please provide password'})
  @MinLength(10, {message: 'Password must be at least 10 characters long'})
  password!: string;

  @IsEnum(UserRole)
  role!: UserRole;
}