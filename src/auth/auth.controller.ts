import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local.guard';
import { GoogleAuthGuard } from './guards/google.guard';
import { GithubAuthGuard } from './guards/github.guard';
import { UserDocument } from '../users/schema/user.schema';

// Register controller with traditional email/password login
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(200)
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  // Login
  @Post('login')
  @HttpCode(200)
  @UseGuards(LocalAuthGuard) // This guard will use the LocalStrategy to authenticate the user
  async login(@Request() req: { user: UserDocument }) {
    // req.user is automatically populated by LocalAuthGuard (LocalStrategy)
    return {
      message: 'Login successfully',
      user: req.user,
      ...(await this.authService.login(req.user)),
    };
  }

  // Login with Google (handled by GoogleStrategy)
  @Get('google/login')
  @UseGuards(GoogleAuthGuard) // This guard will use the GoogleStrategy to authenticate the user
  googleLogin() {
    // This route will redirect the user to Google for authentication
    return {
      message: 'Redirecting to Google for authentication',
    };
  }

  @Get('google/redirect')
  @HttpCode(200)
  @UseGuards(GoogleAuthGuard) // This guard will use the GoogleStrategy to handle the callback from Google
  async googleRedirect(@Request() req: { user: UserDocument }) {
    // req.user is automatically populated by GoogleStrategy after successful authentication
    return {
      message: 'Google authentication successful',
      user: req.user,
      ...(await this.authService.login(req.user)), // Inheritance function login in auth.service.ts to generate JWT token for the user
    };
  }

  @Get('github/login')
  @UseGuards(GithubAuthGuard)
  githubLogin() {
    return {
      message: 'Redirecting to GitHub for authentication',
    };
  }

  @Get('github/redirect')
  @HttpCode(200)
  @UseGuards(GithubAuthGuard)
  async githubRedirect(@Request() req: { user: UserDocument }) {
    return {
      message: 'GitHub authentication successful',
      user: req.user,
      ...(await this.authService.login(req.user)), // Inheritance function login in auth.service.ts to generate JWT token for the user
    };
  }
}
