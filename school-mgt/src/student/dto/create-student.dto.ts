import {  IsDateString, IsEmail, IsEnum, IsOptional, IsString, Matches, MinLength } from "class-validator";



export class CreateStudentDto {




    @IsString()
    @MinLength(3)
    admissionNumber!: string;

    @IsString()
    @MinLength(2)
    firstName!: string;

    @IsString()
    @MinLength(2)
    lastName!: string;

    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(10)
    password!: string;

    @IsEnum(['Male', 'Female'],{
        message: 'Gender must be either Male or Female',
    })
    gender!: string;

    @IsDateString()
    dateOfBirth!: Date;


    @IsString()
    @MinLength(2)
    className!: string;

    @IsOptional()
    @IsString()
    @Matches(/^[0-9+\-\s]+$/, {
    message: 'Phone number is invalid',
  })
    phoneNumber?: string;

    @IsOptional()
    @IsString()
    address?: string;

}