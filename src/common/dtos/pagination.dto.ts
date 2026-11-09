import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";


export class PaginationDto {
    
    
    @IsOptional()
    @IsPositive()
    @Type( () => Number ) // Lo convierte a Numero de JS
    limit?: number;

    @IsOptional()
    @Min(0)
    @Type( () => Number )
    offset?: number
}