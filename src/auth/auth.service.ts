import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt'

import { User } from './entities/user.entity.js';
import { CreateUserDto, LoginUserDto } from './dto/index.js';
import { JwtPayload } from './interfaces/jwt-payload.interface.js';


@Injectable()
export class AuthService {

  constructor(

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    
    private readonly jwtService: JwtService
  ) {}

  async create(createUserDto: CreateUserDto) {

    try {

      const { password, ...userData } = createUserDto;

      // Se prepara para ser insertado
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync( password, 10 )
      });

      // Se guarda en la BD
      await this.userRepository.save( user );

      const { password: _, ...newUser } = user;

      return {
        ...newUser,
        token: this.getJwtToken({ id: newUser.id })
      };

      // TODO: Retornar el JWT de acceso

    } catch (error) {
      this.handleDBErrors(error)
    }

  }

  async login(loginUserDto: LoginUserDto) {

    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({ 
      where: { email },
      select: { email: true, password: true, id: true }
    });

    if( !user ) {
      throw new UnauthorizedException(`Credentials are not valod (email)`);
    }

    if( !bcrypt.compareSync( password, user.password ) ) {
      throw new UnauthorizedException(`Credentials are not valod (password)`);
    }

    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };

  }

  private getJwtToken( payload: JwtPayload ) {

    const token = this.jwtService.sign( payload );

    return token;

  }

  private handleDBErrors( error: any): never {

    if(error.code === "23505") {
      throw new BadRequestException( error.detail )
    }

    throw new InternalServerErrorException('Please check server logs');
  }

}
