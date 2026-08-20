
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
  IsBoolean,
} from 'class-validator';

export class UpdateParentDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsPhoneNumber('NG')
  phoneNumber?: string;

  @IsOptional()
  @IsPhoneNumber('NG')
  alternatePhoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  occupation?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
