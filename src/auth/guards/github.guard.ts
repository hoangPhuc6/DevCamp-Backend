import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

Injectable();
// This guard will use the 'github' strategy defined in GithubStrategy to authenticate users
export class GithubAuthGuard extends AuthGuard('github') {}
