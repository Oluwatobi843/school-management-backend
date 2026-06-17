import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { Student } from './entities/student.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';

@Module({

  imports:[TypeOrmModule.forFeature([Student, User])],
  controllers: [StudentController],
  providers: [StudentService]
})
export class StudentModule {}
