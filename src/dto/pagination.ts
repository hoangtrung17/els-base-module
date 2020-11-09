import { IsNumber, IsOptional, IsString } from 'class-validator';

export class Pagination {
    @IsOptional()
    @IsString()
    readonly where?: string

    @IsOptional()
    @IsNumber()
    readonly limit: number = 10

    @IsOptional()
    @IsNumber()
    readonly offset: number = 0
} 