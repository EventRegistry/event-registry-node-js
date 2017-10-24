import { Query } from "./base";
import { ReturnInfo } from "./returnInfo";
import { ER } from "./types";
export declare class QueryArticles extends Query<RequestArticles> {
    constructor(args?: ER.QueryArticles.Arguments);
    readonly path: string;
    addRequestedResult(requestArticles: any): void;
    setRequestedResult(requestArticles: any): void;
    static initWithArticleUriList(uriList: any): QueryArticles;
    static initWithComplexQuery(query: any, complexQuery: any): any;
}
export declare class QueryArticlesIter extends QueryArticles {
    private er;
    private sortBy;
    private sortByAsc;
    private returnInfo;
    private articleBatchSize;
    private uriPage;
    private returnedDataSize;
    private maxItems;
    private uriWgtList;
    private allUriPages;
    constructor(er: any, args?: {
        [name: string]: any;
    });
    execQuery(callback: (item, error) => void, doneCallback?: (error) => void): void;
    static initWithComplexQuery(query: any, complexQuery: any): any;
    private getNextUriPage();
    private readonly batchSize;
    private getNextBatch(callback, doneCallback);
}
export declare class RequestArticles {
}
export declare class RequestArticlesInfo extends RequestArticles {
    resultType: string;
    params: any;
    constructor({page, count, sortBy, sortByAsc, returnInfo}?: {
        page?: number;
        count?: number;
        sortBy?: string;
        sortByAsc?: boolean;
        returnInfo?: ReturnInfo;
    });
}
export declare class RequestArticlesUriList extends RequestArticles {
    resultType: string;
    params: any;
    constructor({page, count, sortBy, sortByAsc}?: {
        page?: number;
        count?: number;
        sortBy?: string;
        sortByAsc?: boolean;
    });
    setPage(page: any): void;
}
export declare class RequestArticlesUriWgtList extends RequestArticles {
    resultType: string;
    params: any;
    constructor({page, count, sortBy, sortByAsc}?: {
        page?: number;
        count?: number;
        sortBy?: string;
        sortByAsc?: boolean;
    });
    setPage(page: any): void;
}
export declare class RequestArticlesTimeAggr extends RequestArticles {
    resultType: string;
}
export declare class RequestArticlesConceptAggr extends RequestArticles {
    resultType: string;
    params: any;
    constructor({conceptCount, articlesSampleSize, returnInfo}?: {
        conceptCount?: number;
        articlesSampleSize?: number;
        returnInfo?: ReturnInfo;
    });
}
export declare class RequestArticlesCategoryAggr extends RequestArticles {
    resultType: string;
    params: any;
    constructor({articlesSampleSize, returnInfo}?: {
        articlesSampleSize?: number;
        returnInfo?: ReturnInfo;
    });
}
export declare class RequestArticlesSourceAggr extends RequestArticles {
    resultType: string;
    params: any;
    constructor({articlesSampleSize, returnInfo}?: {
        articlesSampleSize?: number;
        returnInfo?: ReturnInfo;
    });
}
export declare class RequestArticlesKeywordAggr extends RequestArticles {
    resultType: string;
    params: any;
    constructor({lang, articlesSampleSize}?: {
        lang?: string;
        articlesSampleSize?: number;
    });
}
export declare class RequestArticlesConceptGraph extends RequestArticles {
    resultType: string;
    params: any;
    constructor({conceptCount, linkCount, articlesSampleSize, returnInfo}?: {
        conceptCount?: number;
        linkCount?: number;
        articlesSampleSize?: number;
        returnInfo?: ReturnInfo;
    });
}
export declare class RequestArticlesConceptMatrix extends RequestArticles {
    resultType: string;
    params: any;
    constructor({conceptCount, measure, articlesSampleSize, returnInfo}?: {
        conceptCount?: number;
        measure?: string;
        articlesSampleSize?: number;
        returnInfo?: ReturnInfo;
    });
}
export declare class RequestArticlesConceptTrends extends RequestArticles {
    resultType: string;
    params: any;
    constructor({count, articlesSampleSize, returnInfo}?: {
        count?: number;
        articlesSampleSize?: number;
        returnInfo?: ReturnInfo;
    });
}
export declare class RequestArticlesDateMentionAggr extends RequestArticles {
    resultType: string;
}
export declare class RequestArticlesRecentActivity extends RequestArticles {
    resultType: string;
    params: any;
    constructor({maxArticleCount, updatesAfterTm, updatesAfterMinsAgo, lang, mandatorySourceLocation, returnInfo}?: {
        maxArticleCount?: number;
        updatesAfterTm?: any;
        updatesAfterMinsAgo?: any;
        lang?: any;
        mandatorySourceLocation?: boolean;
        returnInfo?: ReturnInfo;
    });
}
