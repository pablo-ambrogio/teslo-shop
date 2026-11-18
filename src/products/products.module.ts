import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsService } from './products.service.js';
import { ProductsController } from './products.controller.js';
import { Product, ProductImage } from './entities/index.js';
import { FilesModule } from '../files/files.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature([ Product, ProductImage ]),
    FilesModule,
    AuthModule
  ],
  exports: [ProductsService]
})
export class ProductsModule {}
