import { BadRequestException } from '@nestjs/common'
import { ElasticsearchService } from '@nestjs/elasticsearch'
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
            },
        )
    }

    async searchByIds(args: PaginationInput, docsIndexName: string, ids: string[]) {
        const results: any[] = []

        const condition = {
            ids: {
                values: ids
            }
        }

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
    }

    async findOneById(docsIndexName: string, id: string) {
        const condition = {
            ids: {
                values: [id]
            }
        }

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
    }

    async findOneByQuery(where: WhereInput, docsIndexName: string) {
        const condition = {
            match: where
        }

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
    }

    async findOneByManyWhere(wheres: WhereInput[], docsIndexName: string) {
        let arrMust: any[] = []

        for (const where of wheres) {
            arrMust=[ ...arrMust, {match: where}]
        }

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
    }

    async searchAll(args: ListingInput, docsIndexName: string, where?: WhereInput) {
        const results: any[] = []
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

    async updateByQuery(where: any, docsIndexName: string, updateData: any, nestedPrefix?: string) {
        const script = Object.entries(updateData).reduce((result, [key, value]) => {
            return typeof value === 'string' ?
                `${result} ctx._source.${nestedPrefix ? nestedPrefix + '.' + key : key}= '${value}';`
                : `${result} ctx._source.${nestedPrefix ? nestedPrefix + '.' + key : key}= ${value};`
        }, '')

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
    }

    async remove(where: any, docsIndexName: string) {
        this.esService.deleteByQuery({
            index: docsIndexName,
            body: {
                query: {
                    match: where
                }
            }
        })
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