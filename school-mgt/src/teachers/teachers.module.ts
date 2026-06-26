import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { Teacher } from './entities/teacher.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { User } from 'src/auth/entities/user.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Teacher, User], )],
  providers: [TeachersService],
 
})
export class TeachersModule {}
