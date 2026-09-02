import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateParentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  lastName!: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email!: string;

  @IsPhoneNumber('NG')
  @IsNotEmpty()
  phoneNumber!: string;

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
}
