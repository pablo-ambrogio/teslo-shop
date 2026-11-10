import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import type { Relation } from "typeorm";
import { Product } from "./product.entity.js";

@Entity({ name: "products_images" })
export class ProductImage {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    url: string;

    @ManyToOne(
        () => Product,
        (product) => product.images,
        { onDelete: "CASCADE" }
    )
    product:  Relation<Product>;
    // Relation<T> es un tipo de TypeORM que no hace nada en runtime. Su única función es engañar a TypeScript para que, al emitir los metadatos de decoradores, no escriba la clase real sino Object.

}