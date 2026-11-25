
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../auth/entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UserProfileHelper } from './helpers/user-profile.helper';
import { UserProfileMessage } from './enums/user-profile-message.enum';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepo: Repository<UserProfile>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // CREATE USER PROFILE

  async create(userId: number, dto: CreateUserProfileDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(UserProfileMessage.USER_NOT_FOUND);
    }

    const existingProfile = await this.userProfileRepo.findOne({
      where: { userId },
    });

    if (existingProfile) {
      throw new ConflictException(
        UserProfileMessage.PROFILE_ALREADY_EXISTS,
      );
    }

    const profile = this.userProfileRepo.create({
      ...dto,
      userId,
    });

    const savedProfile = await this.userProfileRepo.save(profile);

    return {
      message: UserProfileMessage.PROFILE_CREATED,
      profile: UserProfileHelper.sanitizeProfile(savedProfile),
    };
  }

  // GET AUTHENTICATED USER PROFILE

  async findMyProfile(userId: number) {
    const profile = await this.userProfileRepo.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException(
        UserProfileMessage.PROFILE_NOT_FOUND,
      );
    }

    return UserProfileHelper.sanitizeProfile(profile);
  }

  // UPDATE AUTHENTICATED USER PROFILE

  async updateMyProfile(
    userId: number,
    dto: UpdateUserProfileDto,
  ) {
    const profile = await this.userProfileRepo.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException(
        UserProfileMessage.PROFILE_NOT_FOUND,
      );
    }

    Object.assign(profile, dto);

    const updatedProfile = await this.userProfileRepo.save(profile);

    return {
      message: UserProfileMessage.PROFILE_UPDATED,
      profile: UserProfileHelper.sanitizeProfile(updatedProfile),
    };
  }
}
