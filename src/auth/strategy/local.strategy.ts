import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { UnauthorizedException, Injectable } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email', passwordField: 'passWord' }); // define username and password field for local strategy
  }
  async validate(email: string, passWord: string) {
    const user = await this.authService.validateUser({
      email,
      passWord,
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password'); // Async error handling
    }
    return user;
  }
}
