import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { UserProfileService } from './user-profile.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('UserProfile')
@ApiBearerAuth()
@Controller('user-profile')
@UseGuards(JwtAuthGuard)
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Post()
  @ApiOperation({
    summary: 'Create user profile',
    description: 'Creates a profile for the currently authenticated user.',
  })
  @ApiCreatedResponse({
    description: 'User profile created successfully.',
  })
  @ApiConflictResponse({
    description: 'The user already has a profile.',
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication token is missing or invalid.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request data.',
  })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateUserProfileDto,
  ) {
    return this.userProfileService.create(user.id, dto);
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get my profile',
    description: 'Retrieves the profile of the currently authenticated user.',
  })
  @ApiOkResponse({
    description: 'User profile retrieved successfully.',
  })
  @ApiNotFoundResponse({
    description: 'User profile not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication token is missing or invalid.',
  })
  findMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.userProfileService.findMyProfile(user.id);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Update my profile',
    description: 'Updates the profile of the currently authenticated user.',
  })
  @ApiOkResponse({
    description: 'User profile updated successfully.',
  })
  @ApiNotFoundResponse({
    description: 'User profile not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication token is missing or invalid.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request data.',
  })
  updateMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateUserProfileDto,
  ) {
    return this.userProfileService.updateMyProfile(user.id, dto);
  }
}
