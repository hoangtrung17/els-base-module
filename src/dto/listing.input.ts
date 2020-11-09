import { Field, InputType, Int, registerEnumType } from "@nestjs/graphql"

export enum SortType {
  asc = 'asc',
  desc = 'desc'
}

registerEnumType(SortType, { name: 'SortType' })

export interface SearchInput {
  fieldName: string
  keyword: string
}

export interface WhereInput {
  [fieldName:string]: string
}

export interface SortInput {
  sortBy: string
  sortType: SortType
}

@InputType()
export class PaginationInput {
  @Field(type => Int)
  limit?: number

  @Field(type => Int)
  offset?: number
}

export interface ListingInput {
  where?: WhereInput
  search ?: [SearchInput]
  sort?: SortInput
  pagination: PaginationInput
}