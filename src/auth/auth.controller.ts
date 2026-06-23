import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  Request,
  UseGuards,
  Redirect,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local.guard';
import { GoogleAuthGuard } from './guards/google.guard';
import { GithubAuthGuard } from './guards/github.guard';
import { UserDocument } from '../users/schema/user.schema';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

// Register controller with traditional email/password login
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(200)
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  // Login
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({
    schema: {
      example: {
        email: 'tikitaka@gmail.com',
        password: 'tikitaka',
      },
    },
  })
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
  @ApiOperation({ summary: 'Redirect to Google OAuth login' })
  @UseGuards(GoogleAuthGuard) // This guard will use the GoogleStrategy to authenticate the user
  googleLogin() {
    // This route will redirect the user to Google for authentication
    return {
      message: 'Redirecting to Google for authentication',
    };
  }

  @Get('google/redirect')
  @ApiOperation({ summary: 'Google OAuth callback' })
  @UseGuards(GoogleAuthGuard) // This guard will use the GoogleStrategy to handle the callback from Google
  @Redirect() // Redirect to frontend after successful authentication
  async googleRedirect(@Request() req: { user: UserDocument }) {
    // req.user is automatically populated by GoogleStrategy after successful authentication
    const authToken = await this.authService.login(req.user);
    const token = authToken.accessToken; // Extract the JWT token from the authentication result
    return {
      statusCode: 302,
      url: process.env.FRONTEND_URL!, // Redirect to frontend URL
    };
  }

  @Get('github/login')
  @ApiOperation({ summary: 'Redirect to GitHub OAuth login' })
  @UseGuards(GithubAuthGuard)
  githubLogin() {
    return {
      message: 'Redirecting to GitHub for authentication',
    };
  }

  @Get('github/redirect')
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  @UseGuards(GithubAuthGuard)
  @Redirect() // Redirect to frontend after successful authentication
  async githubRedirect(@Request() req: { user: UserDocument }) {
    const authToken = await this.authService.login(req.user);
    const token = authToken.accessToken; // Extract the JWT token from the authentication result
    return {
      statusCode: 302,
      url: process.env.FRONTEND_URL!, // Redirect to frontend URL
    };
  }
}
