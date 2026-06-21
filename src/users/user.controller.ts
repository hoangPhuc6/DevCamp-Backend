import {
  Controller,
  Get,
  Patch,
  Delete,
  HttpCode,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

//Update profile
export class UpdateProfile extends RegisterDto {}

@Controller('users')
// Protect all route by JwtAuthGuard
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Get all profiles
  @Get()
  @HttpCode(200)
  async getProfile() {
    return await this.userService.getProfile();
  }

  // Get specific profile by display name
  @Get('me/:displayName')
  @HttpCode(200)
  async getProfileByName(@Param('displayName') displayName: string) {
    return await this.userService.getProfileByName(displayName);
  }

  @Patch('me')
  @HttpCode(200)
  async UpdateProfile(@Body() updateProfileDto: UpdateProfile) {
    return await this.userService.updateProfile(updateProfileDto);
  }

  @Delete('me/:displayName')
  @HttpCode(200)
  async deleteProfile(@Param('displayName') displayName: string) {
    return await this.userService.deleteProfile(displayName);
  }
}
