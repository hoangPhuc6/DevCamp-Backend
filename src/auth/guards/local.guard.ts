import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  // 'local' is name will be find to local.strategy.ts
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // return true if user is authenticated, false otherwise
    return super.canActivate(context);
  }
}
