import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { Teacher } from './entities/teacher.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports:[TypeOrmModule.forFeature([Teacher])],
  providers: [TeachersService],
  controllers: [TeachersController]
})
export class TeachersModule {}
