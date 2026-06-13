import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  
  imports: [TypeOrmModule.forFeature([User]),
        JwtModule.register({
          secret: 'superSecretkey',// 
          signOptions: { expiresIn: '1d'}
        }),

  // AuthModule
],

  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
