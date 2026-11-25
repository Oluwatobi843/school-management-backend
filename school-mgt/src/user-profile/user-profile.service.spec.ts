import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { UserProfileService } from './user-profile.service';
import { UserProfile } from './entities/user-profile.entity';
import { User } from '../auth/entities/user.entity';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UserProfileMessage } from './enums/user-profile-message.enum';

describe('UserProfileService', () => {
  let service: UserProfileService;

  let mockUserProfileRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  let mockUserRepo: {
    findOne: jest.Mock;
  };

  const mockUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  };

  const mockProfile = {
    id: 1,
    userId: 1,
    phoneNumber: '08012345678',
    profilePicture: 'profile.jpg',
    dateOfBirth: new Date('2000-01-01'),
    address: 'Lagos',
    city: 'Ikeja',
    state: 'Lagos',
    country: 'Nigeria',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockUserProfileRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockUserRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserProfileService,
        {
          provide: getRepositoryToken(UserProfile),
          useValue: mockUserProfileRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    service = module.get<UserProfileService>(UserProfileService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SERVICE INITIALIZATION

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // CREATE PROFILE

  describe('create', () => {
    const userId = 1;

    const createDto: CreateUserProfileDto = {
      phoneNumber: '08012345678',
      profilePicture: 'profile.jpg',
      address: 'Lagos',
      city: 'Ikeja',
      state: 'Lagos',
      country: 'Nigeria',
    };

    it('should create a user profile successfully', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      mockUserProfileRepo.findOne.mockResolvedValue(null);
      mockUserProfileRepo.create.mockReturnValue(mockProfile);
      mockUserProfileRepo.save.mockResolvedValue(mockProfile);

      const result = await service.create(userId, createDto);

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });

      expect(mockUserProfileRepo.findOne).toHaveBeenCalledWith({
        where: { userId },
      });

      expect(mockUserProfileRepo.create).toHaveBeenCalledWith({
        ...createDto,
        userId,
      });

      expect(mockUserProfileRepo.save).toHaveBeenCalledWith(mockProfile);

      expect(result).toEqual({
        message: UserProfileMessage.PROFILE_CREATED,
        profile: expect.objectContaining({
          id: 1,
          userId: 1,
          phoneNumber: '08012345678',
        }),
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.create(userId, createDto)).rejects.toThrow(
        new NotFoundException(UserProfileMessage.USER_NOT_FOUND),
      );

      expect(mockUserProfileRepo.findOne).not.toHaveBeenCalled();
      expect(mockUserProfileRepo.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when profile already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      mockUserProfileRepo.findOne.mockResolvedValue(mockProfile);

      await expect(service.create(userId, createDto)).rejects.toThrow(
        new ConflictException(UserProfileMessage.PROFILE_ALREADY_EXISTS),
      );

      expect(mockUserProfileRepo.save).not.toHaveBeenCalled();
    });
  });

  // FIND MY PROFILE

  describe('findMyProfile', () => {
    const userId = 1;

    it('should return the authenticated user profile', async () => {
      mockUserProfileRepo.findOne.mockResolvedValue(mockProfile);

      const result = await service.findMyProfile(userId);

      expect(mockUserProfileRepo.findOne).toHaveBeenCalledWith({
        where: { userId },
      });

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          userId: 1,
          phoneNumber: '08012345678',
        }),
      );
    });

    it('should throw NotFoundException when profile does not exist', async () => {
      mockUserProfileRepo.findOne.mockResolvedValue(null);

      await expect(service.findMyProfile(userId)).rejects.toThrow(
        new NotFoundException(UserProfileMessage.PROFILE_NOT_FOUND),
      );
    });
  });

  // UPDATE MY PROFILE

  describe('updateMyProfile', () => {
    const userId = 1;

    const updateDto: UpdateUserProfileDto = {
      phoneNumber: '08098765432',
      city: 'Lekki',
      state: 'Lagos',
    };

    it('should update the authenticated user profile successfully', async () => {
      const existingProfile = { ...mockProfile };

      const updatedProfile = {
        ...existingProfile,
        ...updateDto,
      };

      mockUserProfileRepo.findOne.mockResolvedValue(existingProfile);
      mockUserProfileRepo.save.mockResolvedValue(updatedProfile);

      const result = await service.updateMyProfile(userId, updateDto);

      expect(mockUserProfileRepo.findOne).toHaveBeenCalledWith({
        where: { userId },
      });

      expect(mockUserProfileRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          phoneNumber: '08098765432',
          city: 'Lekki',
          state: 'Lagos',
        }),
      );

      expect(result).toEqual({
        message: UserProfileMessage.PROFILE_UPDATED,
        profile: expect.objectContaining({
          userId: 1,
          phoneNumber: '08098765432',
          city: 'Lekki',
        }),
      });
    });

    it('should throw NotFoundException when profile does not exist', async () => {
      mockUserProfileRepo.findOne.mockResolvedValue(null);

      await expect(service.updateMyProfile(userId, updateDto)).rejects.toThrow(
        new NotFoundException(UserProfileMessage.PROFILE_NOT_FOUND),
      );

      expect(mockUserProfileRepo.save).not.toHaveBeenCalled();
    });
  });
});
