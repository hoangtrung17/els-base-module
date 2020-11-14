export interface FilterRange {
    gte: string
    lte: string
}

export interface RangeInput {
    [fieldName: string]: FilterRange
}