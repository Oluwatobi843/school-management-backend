import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';

import { StudentModule } from './student/student.module';

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
  StudentModule,
   

  ],
  controllers: [AppController],
  providers: [AppService],
  
})
export class AppModule {}
