import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract JWT from the Authorization header as a Bearer token
      ignoreExpiration: false, // check expiration of JWT if false it will auto check
      secretOrKey: configService.get<string>('secretJwt') as string, //Read secret key from .env file
    });
  }

  // This is method that will be called by Passport after it verifies the JWT token. The payload parameter contains the decoded JWT payload.
  validate(payload: Record<string, unknown>) {
    return payload;
  }
}
