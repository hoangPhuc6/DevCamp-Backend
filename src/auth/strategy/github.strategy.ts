import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile as Pro } from 'passport-github2';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
      scope: ['user:email'], // Request access to the user's email addresses
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Pro) {
    const email = profile.emails?.[0]?.value || '';

    // Check if the user already exists in the database, if not create a new user
    const user = await this.authService.validateGithubUser(
      email,
      profile.id,
      profile.displayName,
    );
    return user;
  }
}
