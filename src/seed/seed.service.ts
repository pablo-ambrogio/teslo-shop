import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service.js';
import { initialData } from './data/seed-data.js';
import { User } from '../auth/entities/user.entity.js';
import * as bcrypt from 'bcrypt'

@Injectable()
export class SeedService {

  constructor( 
    private readonly productService: ProductsService,

    @InjectRepository( User )
    private readonly userRepository: Repository<User>
  ){ }

  async runSeed() {

    await this.deleteTables();

    const user = await this.insertNewUsers();

    await this.insertNewProducts( user );

    return 'executed seed';
  }

  private async deleteTables() {

    await this.productService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    await queryBuilder
    .delete()
    .execute()

  }

  private async insertNewUsers() {

    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach( user => {
      const { password } = user;
      user.password = bcrypt.hashSync( password, 10 )
      users.push( this.userRepository.create(user) )
    });

    const dbUsers = await this.userRepository.save(seedUsers);

    return dbUsers[0];

  }

  private async insertNewProducts( user: User ) {
    await this.productService.deleteAllProducts();

    const products = initialData.products;

    const insertPromesis = products.map( product => this.productService.create( product, user ) )

    await Promise.all( insertPromesis );

    return true;
  }

}
