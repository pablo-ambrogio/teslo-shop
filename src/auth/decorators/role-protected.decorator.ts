import { Reflector } from '@nestjs/core';
import { ValidRoles } from '../interfaces/valid-roles.js';


export const RoleProtected = Reflector.createDecorator<ValidRoles[]>();
