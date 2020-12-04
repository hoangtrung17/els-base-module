import { BadRequestException } from '@nestjs/common'
import { ElasticsearchService } from '@nestjs/elasticsearch'
import { RangeInput } from '../dto/range-input'
import { ListingInput, PaginationInput, WhereInput } from "../dto/listing.input";

export class SearchBase {
    constructor(public readonly esService: ElasticsearchService) {
    }

    buildGettingParams(args: ListingInput) {
        const searchFields = args.search || []
        const params = searchFields.length ? Object.assign({}, ...searchFields.map(field => ({ [field.fieldName]: field.keyword }))) : {}
        return params
    }

    buildTextGettingParams(args: ListingInput) {
        const searchFields = args.search || []
        const params = searchFields.length ? Object.assign({}, ...searchFields.map(field => ({
            [field.fieldName]: {
                value: '*' + field.keyword + '*',
                boost: 1.0,
                rewrite: "constant_score"
            }
        }))) : {}
        return params
    }

    async pushDocs(docs: any, docsIndexName: string) {
        const body = await this.parseAndPrepareData(docs, docsIndexName)
        this.esService.bulk(
            {
                index: docsIndexName,
                body,
            },
            (err) => {
                if (err) {
                    throw new BadRequestException(err.message)
                }
            },
        )
    }

    async pushData(doc: any, docsIndexName: string) {
        const body = await this.parseAndPrepareData([doc], docsIndexName)
        this.esService.bulk(
            {
                index: docsIndexName,
                body,
            },
            (err) => {
                if (err) {
                    throw new BadRequestException(err.message)
                }
            }
        )
    }

    async searchByIds(args: PaginationInput, docsIndexName: string, ids: string[]) {
        const results: any[] = []

        const condition = {
            ids: {
                values: ids
            }
        }

        try {
            const { body } = await this.esService.search({
                index: docsIndexName,
                body: {
                    size: args.limit,
                    from: args.offset,
                    query: condition
                },
            })
            const hits = body.hits.hits
            hits.map((item: { _source: any }) => {
                results.push(item._source)
            })

            return args.limit === 1 ? { results, total: body.hits.total.value, data: results[0] } : {
                results,
                total: body.hits.total.value
            }
        } catch (error) {
            return error
        }
    }

    async findOneById(docsIndexName: string, id: string) {
        const condition = {
            ids: {
                values: [id]
            }
        }

        try {
            const { body } = await this.esService.search({
                index: docsIndexName,
                body: {
                    size: 1,
                    from: 0,
                    query: condition
                },
            })
            const hits = body.hits.hits

            return hits.length ? hits[0]._source : null
        } catch (error) {
            return error
        }
    }

    async findOneByQuery(where: WhereInput, docsIndexName: string) {
        const condition = {
            match: where
        }

        try {
            const { body } = await this.esService.search({
                index: docsIndexName,
                body: {
                    size: 1,
                    from: 0,
                    query: condition
                },
            })
            const hits = body.hits.hits

            return hits.length ? hits[0]._source : null
        } catch (error) {
            return error
        }
    }

    async findOneByManyWhere(wheres: WhereInput[], docsIndexName: string) {
        let arrMust: any[] = []

        for (const where of wheres) {
            arrMust = [...arrMust, { match: where }]
        }

        try {
            const { body } = await this.esService.search({
                index: docsIndexName,
                body: {
                    size: 1,
                    from: 0,
                    query: {
                        bool: {
                            must: arrMust
                        }
                    }
                },
            })
            const hits = body.hits.hits

            return hits.length ? hits[0]._source : null
        } catch (error) {
            return error
        }
    }

    async searchAllByManyWhere(args: ListingInput, docsIndexName: string, wheres: WhereInput[], range?: RangeInput) {
        let arrMust: any[] = []
        const results: any[] = []

        for (const match of wheres) {
            arrMust = [...arrMust, { match }]
        }
        if (range) {
            arrMust = [...arrMust, { range }]
        }

        const sort = args.sort ? [
            {
                [args.sort.sortBy]: {
                    'order': args.sort.sortType
                }
            }] : []
        try {
            const { body } = await this.esService.search({
                index: docsIndexName,
                body: {
                    size: args.pagination.limit,
                    from: args.pagination.offset,
                    query: {
                        bool: {
                            must: arrMust
                        }
                    },
                    sort: sort
                },
            })

            const hits = body.hits.hits
            hits.map((item: { _source: any }) => {
                results.push(item._source)
            })

            return { results, total: body.hits.total.value }
        } catch (error) {
            return error
        }
    }

    async searchAll(args: ListingInput, docsIndexName: string, where?: WhereInput) {
        const results: any[] = []
        where = where ? where : args.where
        const condition = where ? where : this.buildGettingParams(args)

        const query = where || args.search ? { match: condition } : {
            match_all: {}
        }

        const sort = args.sort ? [
            {
                [args.sort.sortBy]: {
                    'order': args.sort.sortType
                }
            }] : []
        try {
            const { body } = await this.esService.search({
                index: docsIndexName,
                body: {
                    size: args.pagination.limit,
                    from: args.pagination.offset,
                    query: query,
                    sort: sort
                },
            })
            const hits = body.hits.hits
            hits.map((item: { _source: any }) => {
                results.push(item._source)
            })

            return { results, total: body.hits.total.value }
        } catch (error) {
            const { body } = await this.esService.search({
                index: docsIndexName,
                body: {
                    size: args.pagination.limit,
                    from: args.pagination.offset,
                    query: query,
                    sort: sort
                },
            })
            const hits = body.hits.hits
            hits.map((item: { _source: any }) => {
                results.push(item._source)
            })

            return { results, total: body.hits.total.value }
        }
    }

    async searchTextAll(args: ListingInput, docsIndexName: string, where?: any) {
        const results: any[] = []
        const condition = where ? where : this.buildTextGettingParams(args)

        const query = where || args.search ? { wildcard: condition } : {
            match_all: {}
        }

        const sort = args.sort ? [
            {
                [args.sort.sortBy]: {
                    'order': args.sort.sortType
                }
            }] : []
        try {
            const { body } = await this.esService.search({
                index: docsIndexName,
                body: {
                    size: args.pagination.limit,
                    from: args.pagination.offset,
                    query: query,
                    sort: sort
                },
            })
            const hits = body.hits.hits
            hits.map((item: { _source: any }) => {
                results.push(item._source)
            })

            return { results, total: body.hits.total.value }
        } catch (error) {
            return error
        }
    }

    async searchRelativeTextAll(args: ListingInput, docsIndexName: string) {
        const results: any[] = []
        if (args.search && args.search.length) {
            const query = {
                "query_string": {
                    "query": args.search[0].keyword,
                    "default_field": args.search[0].fieldName
                }
            }
            const sort = args.sort ? [
                {
                    [args.sort.sortBy]: {
                        'order': args.sort.sortType
                    }
                }] : []
            try {
                const { body } = await this.esService.search({
                    index: docsIndexName,
                    body: {
                        size: args.pagination.limit,
                        from: args.pagination.offset,
                        query: query,
                        sort: sort
                    },
                })
                const hits = body.hits.hits
                hits.map((item: { _source: any }) => {
                    results.push(item._source)
                })

                return { results, total: body.hits.total.value }
            } catch (error) {
                return error
            }
        } else {
            return { results: [], total: 0 }
        }

    }

    async updateByQuery(where: any, docsIndexName: string, updateData: any, nestedPrefix?: string) {
        const script = Object.entries(updateData).reduce((result, [key, value]) => {
            return typeof value === 'string' ?
                `${result} ctx._source.${nestedPrefix ? nestedPrefix + '.' + key : key}= '${value}';`
                : `${result} ctx._source.${nestedPrefix ? nestedPrefix + '.' + key : key}= ${value};`
        }, '')
        try {
            return this.esService.updateByQuery({
                index: docsIndexName,
                refresh: true,
                body: {
                    query: {
                        match: where
                    },
                    script: {
                        inline: script
                    }
                }
            })
        } catch (error) {
            return error
        }
    }

    async remove(where: any, docsIndexName: string) {
        try {
            return this.esService.deleteByQuery({
                index: docsIndexName,
                body: {
                    query: {
                        match: where
                    }
                }
            })
        } catch (error) {
            return error
        }
    }

    async parseAndPrepareData(docs: any[], docsIndexName: string) {
        const body: { index: { _index: string; _id: any } }[] = []
        docs.map((item) => {
            body.push(
                {
                    index: {
                        _index: docsIndexName,
                        _id: item.id
                    }
                },
                item
            )
        })
        return body
    }
}