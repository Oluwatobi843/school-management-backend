import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo : Repository<User>
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
}
