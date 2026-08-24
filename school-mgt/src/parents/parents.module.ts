import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ParentsController } from './parents.controller';
import { ParentsService } from './parents.service';

import { Parent } from './entities/parent.entity';
import { ParentStudent } from './entities/parent-student.entity';
import { Student } from '../student/entities/student.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Parent,
      ParentStudent,
      Student,
    ]),
  ],
  controllers: [ParentsController],
  providers: [ParentsService],
  exports: [ParentsService],
})
export class ParentsModule {}