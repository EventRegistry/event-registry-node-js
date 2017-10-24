import { Query, ReturnInfo } from "./index";
export declare class QueryStory extends Query<RequestStory> {
    constructor(storyUriOrList: any);
    readonly path: string;
    queryByUri(uriOrUriList: any): void;
    addRequestedResult(requestStory: any): void;
    setRequestedResult(requestStory: any): void;
}
export declare class RequestStory {
}
export declare class RequestStoryInfo extends RequestStory {
    resultType: string;
    params: any;
    constructor(returnInfo?: ReturnInfo);
}
export declare class RequestStoryArticles extends RequestStory {
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
export declare class RequestStoryArticleUris extends RequestStory {
    resultType: string;
    params: any;
    constructor({sortBy, sortByAsc}?: {
        sortBy?: string;
        sortByAsc?: boolean;
    });
}
export declare class RequestStoryArticleTrend extends RequestStory {
    resultType: string;
    params: any;
    constructor({lang, minArticleCosSim, returnInfo}?: {
        lang?: string[];
        minArticleCosSim?: number;
        returnInfo?: ReturnInfo;
    });
}
export declare class RequestStorySimilarStories extends RequestStory {
    resultType: string;
    params: any;
    constructor({count, source, maxDayDiff, addArticleTrendInfo, returnInfo}?: {
        count?: number;
        source?: string;
        maxDayDiff?: number;
        addArticleTrendInfo?: boolean;
        returnInfo?: ReturnInfo;
    });
}
