import { Reflector } from '@nestjs/core';
import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from '../../entities/user.entity.js';
import { RoleProtected } from '../../decorators/role-protected.decorator.js';

@Injectable()
export class UserRoleGuard implements CanActivate {
  
  constructor(
    private readonly reflector: Reflector
  ){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get( RoleProtected, context.getHandler() )
    
    console.log({validRoles});
    if( !validRoles ) return true;
    if( validRoles.length === 0 ) return true;

    const req = context.switchToHttp().getRequest();
    const user: User = req.user;

    if( !user ) {
      throw new BadRequestException('User not found');
    }

    for (const rol of user.roles) {
      if( validRoles.includes(rol) ){
        return true;
      }
    }

    throw new ForbiddenException(`User ${ user.fullName } need a valid role: [${ validRoles }]`)
  }
}
