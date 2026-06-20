import { IsBoolean, IsDateString, IsEmail, IsOptional, IsString } from "class-validator";

export class CreateTeacherDto {
    @IsString()
    employeeId!: string;

    @IsString()
    firstName!: string;

    @IsString()
    lastName!: string;

     @IsString()
     gender!: string;

     @IsDateString()
     dateOfBirth!: Date

    @IsEmail()
    email!: string;

     @IsString()
    phoneNumber!: string;

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