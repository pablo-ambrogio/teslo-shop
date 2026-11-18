import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { PaginationDto } from '../common/dtos/pagination.dto.js';
import { Auth } from '../auth/decorators/auth.decorator.js';
import { ValidRoles } from '../auth/interfaces/valid-roles.js';
import { GetUser } from '../auth/decorators/get-user.decorator.js';
import { User } from '../auth/entities/user.entity.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Auth()
  create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: User
  ) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  findAll( @Query() paginationDto : PaginationDto ) {
    return this.productsService.findAll( paginationDto );
  }

  @Get(':term')
  findOne(@Param('term' ) term: string) {
    return this.productsService.findOnePlain(term);
  }

  @Patch(':id')
  @Auth( ValidRoles.admin )
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User
  ) {
    return this.productsService.update( id, updateProductDto, user );
  }

  @Delete(':id')
  @Auth( ValidRoles.admin )
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
