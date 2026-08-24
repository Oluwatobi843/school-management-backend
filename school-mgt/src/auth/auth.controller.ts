
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import type { Response } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

 
  // LOCAL AUTHENTICATION
 

  // Register
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // Login


  
  // GOOGLE AUTHENTICATION
 

  // Start Google login
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    // Passport handles the redirect to Google.
  }

  // Google callback
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.googleLogin(req.user);

    return res.json(result);
  }

 
  // PROTECTED ROUTES
  

  // Get profile
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    return this.authService.getUserById(req.user.id);
  }

  // Update profile
  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Req() req: any,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(req.user.id, dto);
  }

  // Change password
  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Req() req: any,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      req.user.id,
      dto,
    );
  }
}

