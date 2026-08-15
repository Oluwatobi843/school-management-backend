import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { AttendanceStatus } from '../entities/attendance.entity';

export class CreateAttendanceDto {
  @IsInt()
  @Min(1)
  studentId!: number;

  @IsInt()
  @Min(1)
  classId!: number;

  @IsDateString()
  date!: string;

  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;

  @IsOptional()
  @IsString()
  remark?: string;
}