import { Controller, Get, } from '@nestjs/common';
import { SeedService } from './seed.service.js';
import { Auth } from '../auth/decorators/auth.decorator.js';
import { ValidRoles } from '../auth/interfaces/valid-roles.js';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  // @Auth( ValidRoles.admin )
  excecuteSeed() {
    return this.seedService.runSeed();
  }

}
