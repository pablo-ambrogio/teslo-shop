import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { Product } from './entities/product.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto.js';
import { validate as isUUID } from 'uuid'
import { ProductImage } from './entities/product-images.entity.js';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger("ProductsService");

  constructor(

    // Inyectamos repository
    @InjectRepository( Product )
    private readonly productRepository: Repository< Product >,

    @InjectRepository( ProductImage )
    private readonly productImageRepository: Repository< ProductImage >,

    //Inyectamos la conexión de la base de datos
    private readonly dataSource: DataSource

  ){}

  async create(createProductDto: CreateProductDto) {
  
    try {

      // Esto es reemplazado por el BeforeInsert dentro del Entity
      // if( !createProductDto.slug ) {
      //   createProductDto.slug = createProductDto.title
      //   .toLowerCase()
      //   .replaceAll(" ", "_")
      //   .replaceAll("'","");
      // } else {
      //   createProductDto.slug = createProductDto.slug
      //   .toLowerCase()
      //   .replaceAll(" ", "_")
      //   .replaceAll("'","");
      // }


      const { images = [], ...productDetails } = createProductDto;

      // Crea la instancia del producto **NO** lo guarda en la base de datos
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map( image => this.productImageRepository.create( { url: image } ) )
      });

      // Guardar e impactar en la bd
      await this.productRepository.save( product );

      return { ...product, images };

    } catch (error: any) {
      this.handleDBExceptions( error );
    }
  
  }

  // Paginar
  async findAll( paginationDto: PaginationDto) {
    
    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    });

    return products.map( ({ images, ...rest }) => ({
      ...rest,
      images: images?.map( ({ url }) => url )
    }) )
  }

  async findOne(term?: string) {

    let product: Product | null;

    if( isUUID(term) ) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder("product");
      product = await queryBuilder
        .where(`LOWER(title) =:title or slug =:slug`, {
          title: term?.toLowerCase(), 
          slug: term,
        })
        .leftJoinAndSelect("product.images", "images")
        .getOne()
    }

    if( !product ) throw new NotFoundException(`Product with term ${term} not found`);


    return product;

  }

  // Esto sirve para aplanar las imagenes y hacer que el findOne sigua devolviendo una instancia del objeto porque si se hace esto de aplanar las imagenes dentro del findOne ya no devuelve una instancia de la entidad sino que un objeto.
  async findOnePlain( term: string ) {
    const { images = [], ...rest } = await this.findOne( term ); 
    return {
      ...rest,
      images: images.map( ({ url }) => url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...toUpdate } = updateProductDto;


    // No actualiza, lo prepara para la actualización
    const product = await this.productRepository.preload( {
      id,
      ...toUpdate
    } )

    if( !product ) throw new NotFoundException(`Product with id ${ id } not found`);

    // Create query runner
    let queryRunner: QueryRunner;

    queryRunner = this.dataSource.createQueryRunner();
    
    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {

      if( images ) {
        // Se borran todas las imagenes que tengas el id del producto. Intenta eliminarlo ( Puede fallar )
        await queryRunner.manager.delete( ProductImage, { product : { id } } );

        // Creamos las instancias de las imagenes para guardarlas
        product.images = images.map( (image) => this.productImageRepository.create( { url: image })); 

      } 

      // Acá intenta guardalo ( Puede fallar )
      await queryRunner.manager.save( product );


      // Esto ya no se ocupa porque se esta utilizando el queryRunner
      // await this.productRepository.save( product );

      // Si todo sucedio paso, entonces realiza el commit y guarda los cambios
      await queryRunner.commitTransaction();

      return this.findOnePlain( id );
      
    } catch (error) {

      // Si algo sale mal se ejecuta el rollbackTransaction()
      await queryRunner.rollbackTransaction();

      this.handleDBExceptions(error);
    } finally {
      // Una vez realizado el commit ya no se necesita más el queryRunner y se ejecuta el release();
      await queryRunner.release();
    }

  }

  async remove(id: string) {

    const product = await this.findOne( id );

    await this.productRepository.remove(product);
  }

  private handleDBExceptions( error: any ) {
    if( error.code === '23505' ) throw new BadRequestException(error.detail);

    throw new InternalServerErrorException('Unexpected error, check server logs!');
  }


  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder("product");

    try {
      return await query
      .delete()
      .execute()
      
    } catch (error) {
      this.handleDBExceptions(error);
    }

  }

}
