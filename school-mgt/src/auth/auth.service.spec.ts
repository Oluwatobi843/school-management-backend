import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User, AuthProvider, UserRole } from './entities/user.entity';

jest.mock('bcrypt');
import * as bcrypt from 'bcrypt';

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let jwtService: { sign: jest.Mock };

  const baseUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'hashed',
    role: UserRole.STUDENT,
    authProvider: AuthProvider.LOCAL,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as User;

  const registerDto = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password123',
  };

  beforeEach(async () => {
    mockedBcrypt.hash.mockReset();
    mockedBcrypt.compare.mockReset();
    userRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    jwtService = { sign: jest.fn(() => 'signed-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw BadRequestException when email already exists', async () => {
      userRepo.findOne.mockResolvedValue(baseUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should hash password, save user and return token', async () => {
      userRepo.findOne.mockResolvedValue(null);
      const createdUser = { ...baseUser };
      userRepo.create.mockReturnValue(createdUser);
      userRepo.save.mockResolvedValue(createdUser);
      mockedBcrypt.hash.mockResolvedValue('hashed');

      const result = await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(userRepo.save).toHaveBeenCalledWith(createdUser);
      expect(jwtService.sign).toHaveBeenCalled();
      expect(result.access_token).toBe('signed-token');
      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException when user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'x@x.com', password: 'pw' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when account is disabled', async () => {
      userRepo.findOne.mockResolvedValue({ ...baseUser, isActive: false });

      await expect(
        service.login({ email: baseUser.email, password: 'pw' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for google-only account', async () => {
      userRepo.findOne.mockResolvedValue({
        ...baseUser,
        password: undefined,
      });

      await expect(
        service.login({ email: baseUser.email, password: 'pw' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on password mismatch', async () => {
      userRepo.findOne.mockResolvedValue(baseUser);
      mockedBcrypt.compare.mockResolvedValue(false);

      await expect(
        service.login({ email: baseUser.email, password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return token and sanitized user on success', async () => {
      userRepo.findOne.mockResolvedValue(baseUser);
      mockedBcrypt.compare.mockResolvedValue(true);

      const result = await service.login({
        email: baseUser.email,
        password: 'password123',
      });

      expect(result.access_token).toBe('signed-token');
      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('googleLogin', () => {
    const googleUser = {
      googleId: 'google-1',
      email: 'google@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
    };

    it('should log in an existing active google account', async () => {
      userRepo.findOne.mockResolvedValue({
        ...baseUser,
        email: googleUser.email,
      });

      const result = await service.googleLogin(googleUser);

      expect(result.access_token).toBe('signed-token');
    });

    it('should throw UnauthorizedException for disabled existing account', async () => {
      userRepo.findOne.mockResolvedValue({
        ...baseUser,
        isActive: false,
      });

      await expect(service.googleLogin(googleUser)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when email already in use', async () => {
      userRepo.findOne
        .mockResolvedValueOnce(null) // by googleId
        .mockResolvedValueOnce(baseUser); // by email

      await expect(service.googleLogin(googleUser)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should create a new user when no existing account', async () => {
      userRepo.findOne
        .mockResolvedValueOnce(null) // by googleId
        .mockResolvedValueOnce(null); // by email
      const createdUser = { ...baseUser, ...googleUser };
      userRepo.create.mockReturnValue(createdUser);
      userRepo.save.mockResolvedValue(createdUser);

      const result = await service.googleLogin(googleUser);

      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          googleId: googleUser.googleId,
          role: UserRole.STUDENT,
          authProvider: AuthProvider.GOOGLE,
        }),
      );
      expect(result.access_token).toBe('signed-token');
    });
  });

  describe('getUserById', () => {
    it('should throw UnauthorizedException when user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.getUserById(99)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return sanitized user', async () => {
      userRepo.findOne.mockResolvedValue(baseUser);

      const result = await service.getUserById(1);

      expect(result).not.toHaveProperty('password');
    });
  });

  describe('updateProfile', () => {
    it('should throw UnauthorizedException when user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateProfile(1, { firstName: 'New' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException when email is taken', async () => {
      userRepo.findOne
        .mockResolvedValueOnce(baseUser) // find user by id
        .mockResolvedValueOnce(baseUser); // find existing by email

      await expect(
        service.updateProfile(1, { email: 'taken@example.com' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should merge updates and save', async () => {
      userRepo.findOne
        .mockResolvedValueOnce(baseUser) // find user by id
        .mockResolvedValueOnce(null); // no email conflict
      userRepo.save.mockResolvedValue({ ...baseUser, firstName: 'New' });

      const result = await service.updateProfile(1, {
        firstName: 'New',
      });

      expect(userRepo.save).toHaveBeenCalled();
      expect(result.message).toBe('Profile updated successfully');
    });
  });

  describe('changePassword', () => {
    it('should throw UnauthorizedException when user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.changePassword(1, {
          currentPassword: 'old',
          newPassword: 'new',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for google-only account', async () => {
      userRepo.findOne.mockResolvedValue({
        ...baseUser,
        password: undefined,
      });

      await expect(
        service.changePassword(1, {
          currentPassword: 'old',
          newPassword: 'new',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when current password is wrong', async () => {
      userRepo.findOne.mockResolvedValue(baseUser);
      mockedBcrypt.compare.mockResolvedValue(false);

      await expect(
        service.changePassword(1, {
          currentPassword: 'wrong',
          newPassword: 'new',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should hash and save the new password', async () => {
      userRepo.findOne.mockResolvedValue(baseUser);
      mockedBcrypt.compare.mockResolvedValue(true);
      mockedBcrypt.hash.mockResolvedValue('new-hashed');
      userRepo.save.mockResolvedValue({});

      const result = await service.changePassword(1, {
        currentPassword: 'old',
        newPassword: 'new',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('new', 10);
      expect(result.message).toBe('Password changed successfully');
    });
  });
});
