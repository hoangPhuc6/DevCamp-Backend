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
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local.guard';
import { GoogleAuthGuard } from './guards/google.guard';
import { GithubAuthGuard } from './guards/github.guard';
import { UserDocument } from '../users/schema/user.schema';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

// Register controller with traditional email/password login
@ApiTags('Auth') // Group endpoints in Swagger UI
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Register
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
  @UseGuards(LocalAuthGuard) // This guard will use the LocalStrategy to authenticate the user
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        message: 'Login successfully',
        user: { _id: '123', email: 'user@example.com' },
        accessToken: 'jwt_token_here',
      },
    },
  })
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
  @ApiOperation({ summary: 'Redirect to Google OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirect to Google OAuth' })
  googleLogin() {
    // This route will redirect the user to Google for authentication
    return {
      message: 'Redirecting to Google for authentication',
    };
  }

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard) // This guard will use the GoogleStrategy to handle the callback from Google
  @Redirect() // Redirect to frontend after successful authentication
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirect after login' })
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
  @UseGuards(GithubAuthGuard)
  @ApiOperation({ summary: 'Redirect to GitHub OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirect to GitHub OAuth' })
  githubLogin() {
    return {
      message: 'Redirecting to GitHub for authentication',
    };
  }

  @Get('github/redirect')
  @UseGuards(GithubAuthGuard)
  @Redirect() // Redirect to frontend after successful authentication
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirect after login' })
  async githubRedirect(@Request() req: { user: UserDocument }) {
    const authToken = await this.authService.login(req.user);
    const token = authToken.accessToken; // Extract the JWT token from the authentication result
    return {
      statusCode: 302,
      url: process.env.FRONTEND_URL!, // Redirect to frontend URL
    };
  }
}
