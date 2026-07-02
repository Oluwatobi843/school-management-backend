import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';

import { StudentModule } from './student/student.module';
import { TeachersModule } from './teachers/teachers.module';
import { SubjectsModule } from './subjects/subjects.module';
import { ClassesModule } from './classes/classes.module';

@Module({
  imports: [TypeOrmModule.forRoot({

    type: 'postgres',
    host: 'localhost',
    port:   5432,
    username: 'postgres',
    password: 'root',
    database: 'school-mgt',

    autoLoadEntities: true,
   
    synchronize: true    
 

  }), AuthModule, 
  StudentModule, TeachersModule, SubjectsModule, ClassesModule,
   

  ],
  controllers: [AppController],
  providers: [AppService],
  
})
export class AppModule {}
