import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  email!: string;

  @IsNotEmpty({ message: 'Password is required! Please provide password' })
  @MinLength(10, { message: 'Password must be at least 10 character long' })
  password!: string;
}
