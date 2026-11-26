import { Test, TestingModule } from '@nestjs/testing';

import { UserProfileController } from './user-profile.controller';
import { UserProfileService } from './user-profile.service';

describe('UserProfileController', () => {
  let controller: UserProfileController;

  const mockUserProfileService = {
    create: jest.fn(),
    findMyProfile: jest.fn(),
    updateMyProfile: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserProfileController],
      providers: [
        {
          provide: UserProfileService,
          useValue: mockUserProfileService,
        },
      ],
    }).compile();

    controller = module.get<UserProfileController>(UserProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user profile', async () => {
      const user = { id: 1 } as any;

      const dto = {
        phoneNumber: '+2348012345678',
        city: 'Lagos',
        country: 'Nigeria',
      };

      const expectedResult = {
        message: 'User profile created successfully',
        profile: {
          id: 1,
          userId: 1,
          ...dto,
        },
      };

      mockUserProfileService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(user, dto);

      expect(mockUserProfileService.create).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findMyProfile', () => {
    it('should return the authenticated user profile', async () => {
      const user = { id: 1 } as any;

      const expectedResult = {
        id: 1,
        userId: 1,
        phoneNumber: '+2348012345678',
        city: 'Lagos',
        country: 'Nigeria',
      };

      mockUserProfileService.findMyProfile.mockResolvedValue(expectedResult);

      const result = await controller.findMyProfile(user);

      expect(mockUserProfileService.findMyProfile).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateMyProfile', () => {
    it('should update the authenticated user profile', async () => {
      const user = { id: 1 } as any;

      const dto = {
        phoneNumber: '+2348098765432',
        city: 'Abuja',
      };

      const expectedResult = {
        message: 'User profile updated successfully',
        profile: {
          id: 1,
          userId: 1,
          ...dto,
        },
      };

      mockUserProfileService.updateMyProfile.mockResolvedValue(expectedResult);

      const result = await controller.updateMyProfile(user, dto);

      expect(mockUserProfileService.updateMyProfile).toHaveBeenCalledWith(
        1,
        dto,
      );
      expect(result).toEqual(expectedResult);
    });
  });
});
