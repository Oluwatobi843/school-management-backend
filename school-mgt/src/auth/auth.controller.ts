import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService){}

  @Post('register')
  register(@Body() dto: RegisterDto){
    return this.authService.register(dto)
  }

  @UseGuards()
  @Post('login')
  login(@Body() dto: LoginDto){
    return this.authService.login(dto)
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req:any){
    return this.authService.getUserById(req.user.id)
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Req() req: any,
    @Body() dto: UpdateProfileDto
  ){
    return this.authService.updateProfile(req.user.id, dto)
  }


  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Req() req: any,
    @Body() dto: ChangePasswordDto,
  ){
    return this.authService.changePassword(req.user.id, dto)
  }
}
