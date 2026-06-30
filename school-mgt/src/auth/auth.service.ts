import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  
  // Helper function
  
  private sanitizeUser(user: User) {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  private signToken(user: User) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  
  // REGISTER
  
  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.userRepo.create({
      ...dto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepo.save(user);
    const token = this.signToken(savedUser);

    return {
      message: 'Registration successful',
      access_token: token,
      user: this.sanitizeUser(savedUser),
    };
  }

  
  // LOGIN
  
  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      message: 'Login successful',
      access_token: this.signToken(user),
      user: this.sanitizeUser(user),
    };
  }

  
  // GET USER BY ID
  
  async getUserById(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.sanitizeUser(user);
  }

  
  // UPDATE PROFILE
  
  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepo.findOne({
        where: { email: dto.email },
      });

      if (existing) {
        throw new BadRequestException('Email already exists');
      }
    }

    const updateData: Partial<User> = { ...dto };

    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(user, updateData);

    const updatedUser = await this.userRepo.save(user);

    return {
      message: 'Profile updated successfully',
      user: this.sanitizeUser(updatedUser),
    };
  }

  
  // CHANGE PASSWORD

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isMatch = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);

    await this.userRepo.save(user);

    return {
      message: 'Password changed successfully',
    };
  }
}