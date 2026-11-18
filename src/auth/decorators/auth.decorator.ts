
import { applyDecorators, UseGuards } from '@nestjs/common';
import { ValidRoles } from '../interfaces/valid-roles.js';
import { RoleProtected } from './role-protected.decorator.js';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role/user-role.guard.js';

export function Auth(...roles: ValidRoles[]) {
    return applyDecorators(
        RoleProtected([...roles]),
        UseGuards(AuthGuard(), UserRoleGuard),
    );
}
