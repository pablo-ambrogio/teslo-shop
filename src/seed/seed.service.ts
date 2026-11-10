import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service.js';
import { initialData, SeedProduct } from './data/seed-data.js';

@Injectable()
export class SeedService {

  constructor( 
    private readonly productService: ProductsService
  ){ }

  async runSeed() {

    await this.insertNewProducts();

    return 'executed seed';
  }

  private async insertNewProducts() {
    await this.productService.deleteAllProducts();

    const products = initialData.products;

    const insertPromesis = products.map( product => this.productService.create( product ) )

    await Promise.all( insertPromesis );

    return true;
  }

}
