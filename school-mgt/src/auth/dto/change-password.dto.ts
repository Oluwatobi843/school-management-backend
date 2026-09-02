import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword!: string;

  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(10, { message: 'New password must be at least 10 character long' })
  newPassword!: string;
}
