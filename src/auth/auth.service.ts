import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/schema/user.schema';
import { Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  // Register controller with traditional email/password login
  async register(registerDto: RegisterDto): Promise<UserDocument> {
    const { email } = registerDto;
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException({
        message: 'User with this email already exists',
      });
    }
    const hashedPass = await bcrypt.hash(registerDto.passHash, 10); // Hash password with 10 salt
    const autoDisplayName = email.split('@')[0]; // split email by @ and take the first part as display name
    const createdUser = new this.userModel({
      ...registerDto,
      passHash: hashedPass,
      displayName: autoDisplayName,
    });

    return await createdUser.save(); // save() is a method of Mongoose Model that saves the document to the database
  }

  async validateUser(loginDto: LoginDto): Promise<Partial<User>> {
    const { email, passHash } = loginDto;
    const user = await this.userModel.findOne({ email }); // Check user exist or not
    if (!user) {
      throw new UnauthorizedException('User with this email not found');
    }
    // If user signed up using an external provider, they won't have a password
    if (!user.passHash) {
      throw new UnauthorizedException(
        'Invalid password or user signed up using an external provider',
      );
    }
    const isMatch = await bcrypt.compare(passHash, user.passHash);
    // Check password match
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const result = user.toObject() as Partial<User>; // Remove passHash before returning user object
    delete result.passHash;
    return result;
  }

  // Generate JWT token
  async login(user: UserDocument) {
    const payLoad = {
      email: user.email,
      subject: String(user._id),
    };
    const refreshTokenPayload = {
      subject: String(user._id),
    };
    // Return JWT token for user
    const accessToken = await this.jwtService.signAsync(payLoad, {
      expiresIn: (this.configService.get<string>('expiresIn') ||
        '1h') as JwtSignOptions['expiresIn'],
    }); // Define Jwt.Module with expiry time
    const refreshToken = await this.jwtService.signAsync(refreshTokenPayload, {
      expiresIn: (this.configService.get<string>('expiresIn1') ||
        '7d') as JwtSignOptions['expiresIn'],
    });
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    // Save refreshtoken to Database
    await this.userModel.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          refreshToken: tokenHash,
          expiresAt: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000),
        },
      }, //Date.now() + 60 * 60 * 24 * 7 * 1000 is exprire 7 days
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  // Controller save info of user who login with google
  async validateGoogleUser(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      const newUser = new this.userModel({
        email,
        displayName: email,
        authProviders: {
          provider: 'google',
          providerId: email,
          providerEmail: email,
          providerConnectedAt: new Date(),
        },
      });
      return await newUser.save();
    }
    return user;
  }

  async validateGithubUser(
    email: string,
    githubId: string,
    displayName: string,
  ): Promise<UserDocument> {
    const orConditions: any[] = [{ 'authProviders.providerId': githubId }];
    if (email) {
      orConditions.push({ email }); // If email exists, add condition to find user by email as well (fallback)
    }

    const user = await this.userModel.findOne({
      $or: orConditions, // Find user by githubId first, if not found then fall-back to find by email
    });

    if (!user) {
      const newUser = new this.userModel({
        email: email || `${githubId}@users.noreply.github.com`, // If hide email, use githubId to create a fake email
        displayName: displayName || 'Github User',
        authProviders: {
          provider: 'github',
          providerId: githubId, // Use by githubId as providerId
          providerEmail: email,
          providerConnectedAt: new Date(),
        },
      });
      return await newUser.save();
    }
    return user;
  }
}
