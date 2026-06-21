import { SetMetadata } from '@nestjs/common';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
// Check user's role
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    // Check if this route requires any specific roles.
    if (!requiredRoles) return true;
    const request = context
      .switchToHttp()
      .getRequest<{ user?: { role?: string } }>();
    // Check the user for any roles => block
    const user = request.user;
    if (!user?.role) return false;
    return requiredRoles.includes(user.role);
  }
}
