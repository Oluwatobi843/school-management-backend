import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { Student } from './entities/student.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Class } from 'src/classes/entities/class.entity';

@Module({

  imports:[TypeOrmModule.forFeature([Student, User, Class ])],
  controllers: [StudentController],
  providers: [StudentService]
})
export class StudentModule {}
