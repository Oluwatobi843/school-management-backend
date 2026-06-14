import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo : Repository<User>,
    private readonly jwtService: JwtService,
  ){}


  async register (dto: RegisterDto){
    // 1 check if user exists
    const existing  = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if(existing){
      throw new BadRequestException('Email already exists')
    }

    // 2 Hash Password
    const hashedPassword = await bcrypt.hash(dto.password, 10)

    // 3 create user
    const user = this.userRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: hashedPassword,
      role: dto.role
    });

    // 4. save to database
    return this.userRepo.save(user)
  }



  async login(dto: LoginDto){
    // 1. Find user
    const user = await this.userRepo.findOne({
      where: {email: dto.email},
    });

    if(!user) {
      throw new BadRequestException('Invalid credentials');
    }

    // Compare Password
    const isMatch = await bcrypt.compare(dto.password, user.password)

    if(!isMatch){
      throw new BadRequestException('Invalid credentials');
    }

    // 3. Generate JWT token
    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role
    });

    const {password, ...safeUser} = user

    return {
      message: 'Login successfull',
      access_token: token,
      user: safeUser,
    }
  }

  // Find user by ID
  async getUserById(userId: number){
    const user = await this.userRepo.findOne({
      where: {id: userId}
    })

    if(!user){
      throw new UnauthorizedException('User not found')

    }

    const {password, ...result} = user;

    return result
  }
}
