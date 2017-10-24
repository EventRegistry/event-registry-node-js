import { Query } from "./base";
import { EventRegistry } from "./eventRegistry";
import { ReturnInfo } from "./returnInfo";
import { ER } from "./types";
/**
 * @class QueryEvent
 * Class for obtaining available info for one or more events in the Event Registry
 */
export declare class QueryEvent extends Query<RequestEvent> {
    /**
     * @param eventUriOrList A single event uri or a list of event uris
     * @param requestedResult The information to return as the result of the query. By default return the details of the event
     */
    constructor(eventUriOrList: string | string[], requestedResult?: RequestEventInfo);
    readonly path: string;
    /**
     * Add a result type that you would like to be returned.
     * In case you are a subscribed customer you can ask for multiple result types in a single query
     * (for free users, only a single result type can be required per call).
     * Result types can be the classes that extend RequestEvent base class (see classes below).
     */
    addRequestedResult(requestEvent: RequestEvent): void;
    /**
     * Set the single result type that you would like to be returned. Any previously set result types will be overwritten.
     * Result types can be the classes that extend RequestEvent base class (see classes below).
     */
    setRequestedResult(requestEvent: RequestEvent): void;
}
/**
 * @class QueryEventArticlesIter
 * Class for iterating through all the articles in the event via callbacks
 */
export declare class QueryEventArticlesIter extends QueryEvent {
    private er;
    private lang;
    private sortBy;
    private sortByAsc;
    private returnInfo;
    private articleBatchSize;
    private maxItems;
    private returnedDataSize;
    private eventUri;
    /**
     * @param er instance of EventRegistry class. used to obtain the necessary data
     * @param eventUri a single event for which we want to obtain the list of articles in it
     * @param args Object which contains a host of optional parameters
     */
    constructor(er: EventRegistry, eventUri: string, args?: ER.QueryEvent.IteratorArguments);
    /**
     * Execute query and fetch batches of articles of the specified size (articleBatchSize)
     * @param callback callback function that'll be called every time we get a new batch of articles from the backend
     * @param doneCallback callback function that'll be called when everything is complete
     */
    execQuery(callback: (item, error) => void, doneCallback?: (error) => void): void;
    private initialDataFetch();
    private readonly batchSize;
    private getNextBatch(uriList, callback, doneCallback?);
}
export declare class RequestEvent {
}
/**
 * @class RequestEventInfo
 * Return details about an event
 */
export declare class RequestEventInfo extends RequestEvent {
    resultType: string;
    params: any;
    constructor(returnInfo?: ReturnInfo);
}
/**
 * @class RequestEventArticles
 * Return articles about the event
 */
export declare class RequestEventArticles extends RequestEvent {
    resultType: string;
    params: any;
    constructor(args?: ER.QueryEvent.RequestEventArticlesArguments);
}
/**
 * @class RequestEventArticleUris
 * Return just a list of article uris
 */
export declare class RequestEventArticleUris extends RequestEvent {
    resultType: string;
    params: any;
    constructor(args?: ER.QueryEvent.RequestEventArticleUrisArguments);
}
/**
 * @class RequestEventKeywordAggr
 * Return keyword aggregate (tag-cloud) from articles in the event.
 */
export declare class RequestEventKeywordAggr extends RequestEvent {
    resultType: string;
    params: any;
    /**
     * @param lang: language for which to compute the keywords
     */
    constructor(lang?: string);
}
/**
 * @class RequestEventSourceAggr
 * Get news source distribution of articles in the event.
 */
export declare class RequestEventSourceAggr extends RequestEvent {
    resultType: string;
}
/**
 * @class RequestEventDateMentionAggr
 * Get dates that we found mentioned in the event articles and their frequencies.
 */
export declare class RequestEventDateMentionAggr extends RequestEvent {
    resultType: string;
}
/**
 * @class RequestEventArticleTrend
 * Return trending information for the articles about the event.
 */
export declare class RequestEventArticleTrend extends RequestEvent {
    resultType: string;
    params: any;
    constructor(args?: ER.QueryEvent.RequestEventArticleTrendArguments);
}
/**
 * @class RequestEventSimilarEvents
 * Compute and return a list of similar events.
 */
export declare class RequestEventSimilarEvents extends RequestEvent {
    resultType: string;
    params: any;
    constructor(args?: ER.QueryEvent.RequestEventSimilarEventsArguments);
}
/**
 * @class RequestEventSimilarStories
 * Return a list of similar stories (clusters).
 */
export declare class RequestEventSimilarStories extends RequestEvent {
    resultType: string;
    params: any;
    constructor(args?: ER.QueryEvent.RequestEventSimilarStoriesArguments);
}
