import { IsBoolean, IsEnum, IsInt, IsOptional, Min } from 'class-validator';

import { ParentRelationship } from '../entities/parent-student.entity';

export class LinkParentStudentDto {
  @IsInt()
  @Min(1)
  studentId!: number;

  @IsEnum(ParentRelationship)
  relationship!: ParentRelationship;

  @IsOptional()
  @IsBoolean()
  isPrimaryContact?: boolean;

  @IsOptional()
  @IsBoolean()
  isEmergencyContact?: boolean;
}
