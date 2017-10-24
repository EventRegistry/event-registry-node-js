import { QueryParamsBase } from "./base";
import { ER } from "./types";
/**
 * @class GetSourceInfo
 * Obtain desired information about one or more news sources
 */
export declare class GetSourceInfo extends QueryParamsBase {
    /**
     * @param args Object which contains a host of optional parameters
     */
    constructor(args?: ER.Info.GetSourceInfoArguments);
    /**
     * search sources by uri(s)
     */
    queryByUri(uriOrUriList: string | string[]): void;
    /**
     * search concepts by id(s)
     */
    queryById(idOrIdList: string | string[]): void;
    readonly path: string;
}
/**
 * @class GetConceptInfo
 * Obtain information about concepts
 */
export declare class GetConceptInfo extends QueryParamsBase {
    constructor(args?: ER.Info.GetConceptInfoArguments);
    /**
     * search concepts by uri(s)
     */
    queryByUri(uriOrUriList: string | string[]): void;
    /**
     * search concepts by id(s)
     */
    queryById(idOrIdList: string | string[]): void;
    readonly path: string;
}
/**
 * @class GetCategoryInfo
 * Obtain information about categories
 */
export declare class GetCategoryInfo extends QueryParamsBase {
    constructor(args?: ER.Info.GetCategoryInfoArguments);
    /**
     * search concepts by uri(s)
     */
    queryByUri(uriOrUriList: any): void;
    /**
     * search concepts by id(s)
     */
    queryById(idOrIdList: any): void;
    readonly path: string;
}
/**
 * @class GetSourceStats
 * get stats about one or more sources - return json object will include:
 *  "uri"
 *  "id"
 *  "totalArticles" - total number of articles from this source
 *  "withStory" - number of articles assigned to a story (cluster)
 *  "duplicates" - number of articles that are duplicates of another article
 *  "duplicatesFromSameSource" - number of articles that are copies from articles
 *     from the same source (not true duplicates, just updates of own articles)
 *  "dailyCounts" - json object with date as the key and number of articles for that day as the value
 */
export declare class GetSourceStats extends QueryParamsBase {
    constructor(sourceUri?: string);
    /**
     * get stats about one or more sources specified by their uris
     */
    queryByUri(uriOrUriList: any): void;
    readonly path: string;
}
