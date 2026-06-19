import { IsDateString, IsEmail, IsOptional, IsString } from "class-validator";

export class CreateTeacherDto {
    @IsString()
    employeeId!: string;

    @IsString()
    firstName!: string;

    @IsString()
    lastName!: string;

    @IsEmail()
    email!: string;

     @IsString()
    phoneNumber!: string;

    @IsString()
    gender!: string;

    @IsOptional()
    @IsString()
    qualification?: string;

    @IsOptional()
    @IsString()
    specialization?: string;

    @IsDateString()
    hireDate!: Date;
}