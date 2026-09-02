import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
    googleLogin: jest.Mock;
    getUserById: jest.Mock;
    updateProfile: jest.Mock;
    changePassword: jest.Mock;
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      googleLogin: jest.fn(),
      getUserById: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call register on AuthService', async () => {
    const dto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    } as never;
    authService.register.mockResolvedValue({ message: 'ok' });

    await controller.register(dto);

    expect(authService.register).toHaveBeenCalledWith(dto);
  });

  it('should call login on AuthService', async () => {
    const dto = { email: 'john@example.com', password: 'pw' } as never;
    authService.login.mockResolvedValue({ access_token: 't' });

    await controller.login(dto);

    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('should call getProfile on AuthService', () => {
    const user = { id: 1, email: 'john@example.com' } as never;
    authService.getUserById.mockResolvedValue({ message: 'ok' });

    controller.getProfile(user);

    expect(authService.getUserById).toHaveBeenCalledWith(1);
  });
});
