import { Controller, Post, Body, Get, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service.js';
import { CreateUserDto, LoginUserDto } from './dto/index.js';
import { User } from './entities/user.entity.js';
import { GetUser, RawHeaders, RoleProtected } from './decorators/index.js';
import { UserRoleGuard } from './guards/user-role/user-role.guard.js';
import { ValidRoles } from './interfaces/valid-roles.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[]
  ) {

    return {
      ok: true,
      message: 'Hola mundo private',
      user,
      userEmail,
      rawHeaders
    };
  }


  // @SetMetadata("roles", ["admin", "super-user"])

  @Get('private2')
  @RoleProtected([ValidRoles.user, ValidRoles.superUser])
  @UseGuards( AuthGuard(), UserRoleGuard )
  privateRoute2(
    @GetUser() user: User,
  ) {

    return {
      ok: true,
      user
    };
  }

}
