export declare enum SortType {
    asc = "asc",
    desc = "desc"
}
export interface SearchInput {
    fieldName: string;
    keyword: string;
}
export interface WhereInput {
    [fieldName: string]: string;
}
export interface SortInput {
    sortBy: string;
    sortType: SortType;
}
export declare class PaginationInput {
    limit?: number;
    offset?: number;
}
export interface ListingInput {
    where?: WhereInput;
    search?: [SearchInput];
    sort?: SortInput;
    pagination: PaginationInput;
}
