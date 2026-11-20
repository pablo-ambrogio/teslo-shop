import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { ProductImage } from "./product-images.entity.js";
import { User } from "../../auth/entities/user.entity.js";

@Entity({ name: "products" })
export class Product {

    @ApiProperty({
        example: '27f4b3ae-b8db-4685-bb39-d2044f948db4',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'T-Shirt Teslo',
        description: 'Product Title',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    title: string;

    @ApiProperty({
        example: '0',
        description: 'Product Price'
    })
    @Column('float', {
        default: 0
    })
    price: number;

    @ApiProperty({
        example: 'The Women Cropped Puffer Jacket features a uniquely cropped silhouette for the perfect, modern style while on the go during the cozy season ahead.',
        description: 'Product description',
        default: null
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty({
        example: 't_shirt_teslo',
        description: 'Product SLUG - for SEO ',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    slug: string;

    @ApiProperty({
        example: 10,
        description: 'Product Stock',
        default: 0
    })
    @Column('int', {
        default: 0
    })
    stock: number;

    @ApiProperty({
        example: ['M', 'XL', 'XXL'],
        description: 'Product Sizes',
    })
    @Column('text', {
        array: true
    })
    sizes: string[];

    @ApiProperty({
        example: 'women',
        description: 'Product gender',
    })
    @Column('text')
    gender: string;

    @ApiProperty()
    @Column('text',{
        array: true,
        default: []
    })
    tags: string[]

    @ApiProperty()
    @OneToMany(
        () => ProductImage, // Va a regregar un ProducImage
        (productImage) => productImage.product, // como se relaciona con la tabla de ProductImage
        { cascade: true, eager: true }
    )
    images?:  ProductImage[];

    @ManyToOne(
        () => User,
        ( user ) => user.products,
        { eager: true }
    )
    user: User


    // Antes de insertar en la bd hace este chequeo
    @BeforeInsert()
    checkSlugInsert() {
        if( !this.slug ) {
            this.slug = this.title
        }
        
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(" ", "_")
            .replaceAll("'","");
        
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        
        if( !this.slug ) {       
            this.slug = this.title
        }
        
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(" ", "_")
            .replaceAll("'","");
        
    }

}
