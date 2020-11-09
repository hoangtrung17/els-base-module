import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Pagination } from "../dto/pagination";
import { ListingInput, WhereInput } from "../dto/listing.input";
export declare class SearchBase {
    readonly esService: ElasticsearchService;
    constructor(esService: ElasticsearchService);
    buildGettingParams(args: ListingInput): any;
    buildTextGettingParams(args: ListingInput): any;
    pushDocs(docs: any, docsIndexName: string): Promise<void>;
    pushData(doc: any, docsIndexName: string): Promise<void>;
    searchByIds(args: Pagination, docsIndexName: string, ids?: string[]): Promise<{
        results: any[];
        total: any;
        data: any;
    } | {
        results: any[];
        total: any;
        data?: undefined;
    }>;
    searchAll(args: ListingInput, docsIndexName: string, where?: WhereInput): Promise<{
        results: any[];
        total: any;
    }>;
    searchTextAll(args: ListingInput, docsIndexName: string, where?: any): Promise<{
        results: any[];
        total: any;
    }>;
    updateByQuery(where: any, docsIndexName: string, updateData: any, nestedPrefix?: string): Promise<import("@elastic/elasticsearch").ApiResponse<Record<string, any>, import("@elastic/elasticsearch/lib/Transport").Context>>;
    remove(where: any, docsIndexName: string): Promise<void>;
    parseAndPrepareData(docs: any[], docsIndexName: string): Promise<{
        index: {
            _index: string;
            _id: any;
        };
    }[]>;
}
