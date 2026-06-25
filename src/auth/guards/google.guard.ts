import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
// This guard will use the 'google' strategy defined in GoogleStrategy to authenticate users
export class GoogleAuthGuard extends AuthGuard('google') {}
