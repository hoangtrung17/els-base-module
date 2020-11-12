import { IsNumber, IsOptional } from 'class-validator';

export class Pagination {
    @IsOptional()
    @IsNumber()
    readonly limit: number = 10

    @IsOptional()
    @IsNumber()
    readonly offset: number = 0
} 