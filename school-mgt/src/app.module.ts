import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forRoot({

    type: 'postgres',
    host: 'localhost',
    port:   5432,
    username: 'postgres',
    password: 'root',
    database: 'school-mgt',
    entities: [User ], // Array of entities i entered 
    synchronize: true 


  }), AuthModule

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
