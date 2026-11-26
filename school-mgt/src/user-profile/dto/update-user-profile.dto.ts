import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { ProfileGender } from '../enums/profile-gender.enum';

export class UpdateUserProfileDto {
  @ApiPropertyOptional({
    example: '+2348012345678',
    description: 'Phone number',
  })
  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(20)
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/profile.jpg',
    description: 'Profile picture URL',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  profilePicture?: string;

  @ApiPropertyOptional({
    example: '2000-05-15',
    description: 'Date of birth in ISO date format',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    enum: ProfileGender,
    example: ProfileGender.MALE,
  })
  @IsOptional()
  @IsEnum(ProfileGender)
  gender?: ProfileGender;

  @ApiPropertyOptional({ example: '12 Allen Avenue' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ example: 'Ikeja' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'Lagos' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ example: 'Nigeria' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;
}
