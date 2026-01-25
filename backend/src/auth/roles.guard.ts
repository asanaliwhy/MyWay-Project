import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();

        // Check if any of the user's memberships match the required roles
        // In MyWay, roles are per-org. For MVP simplicity, we check if they have this role AT ALL
        // but in Phase 2 we will scope this to the current org context.
        return requiredRoles.some((role) =>
            user.orgMemberships?.some((m: any) => m.role === role)
        );
    }
}
