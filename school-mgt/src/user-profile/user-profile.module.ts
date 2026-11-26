import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { User } from '../auth/entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';

import { UserProfileController } from './user-profile.controller';
import { UserProfileService } from './user-profile.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([User, UserProfile])],

  controllers: [UserProfileController],

  providers: [UserProfileService],

  exports: [UserProfileService],
})
export class UserProfileModule {}
