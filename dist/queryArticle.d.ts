import { Query } from "./base";
import { ReturnInfo } from "./returnInfo";
import { ER } from "./types";
/**
 * @class QueryArticle
 * Class for obtaining available info for one or more articles in the Event Registry
 */
export declare class QueryArticle extends Query<RequestArticle> {
    /**
     * @param articleUriOrUriList a single article uri or a list of article uris
     * @param requestedResult the information to return as the result of the query. By default return the information about the article
     */
    constructor(articleUriOrUriList: string | string[], requestedResult?: RequestArticleInfo);
    readonly path: string;
    /**
     * Add a result type that you would like to be returned. In one QueryArticle you can ask for multiple result types.
     * Result types can be the classes that extend RequestArticle base class (see classes below).
     * @param requestArticle Determines what info should be returned as a result of the query
     */
    addRequestedResult(requestArticle: any): void;
    /**
     * Set the single result type that you would like to be returned.
     * If some other request type was previously set, it will be overwritten.
     * Result types can be the classes that extend RequestArticle base class (see classes below).
     */
    setRequestedResult(requestArticle: any): void;
}
export declare class RequestArticle {
}
/**
 * Return details about the article
 */
export declare class RequestArticleInfo extends RequestArticle {
    resultType: string;
    params: any;
    /**
     * @param returnInfo what details should be included in the returned information
     */
    constructor(returnInfo?: ReturnInfo);
}
/**
 * Return a list of similar articles based on the CCA
 */
export declare class RequestArticleSimilarArticles extends RequestArticle {
    resultType: string;
    params: any;
    constructor(args?: ER.QueryArticle.RequestArticleSimilarArticlesArguments);
}
/**
 * return a list of duplicated articles of the current article
 */
export declare class RequestArticleDuplicatedArticles extends RequestArticle {
    resultType: string;
    params: any;
    constructor(args?: ER.QueryArticle.RequestArticleDuplicatedArticlesArguments);
}
/**
 * return the article that is the original of the given article (the current article is a duplicate)
 */
export declare class RequestArticleOriginalArticle extends RequestArticle {
    resultType: string;
    params: any;
    /**
     * @param returnInfo: what details should be included in the returned information
     */
    constructor(returnInfo?: ReturnInfo);
}
