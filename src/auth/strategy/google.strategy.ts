import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile as Pro } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Pro) {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new Error('No email found in Google profile');
    }

    // Check if the user already exists in the database, if not exist, create a new user with the information from Google profile
    const user = await this.authService.validateGoogleUser(email);
    return user;
  }
}
