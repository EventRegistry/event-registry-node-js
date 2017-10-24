import { Query } from "./base";
import { EventRegistry } from "./eventRegistry";
import { ReturnInfo } from "./returnInfo";
import { ER } from "./types";
/**
 * @class QueryEvents
 * Class for obtaining available info for one or more events in the Event Registry
 */
export declare class QueryEvents extends Query<RequestEvents> {
    params: {};
    constructor(args?: ER.QueryEvents.Arguments);
    readonly path: string;
    /**
     *  Add a result type that you would like to be returned.
     * In case you are a subscribed customer you can ask for multiple result types
     * in a single query (for free users, only a single result type can be required per call).
     * Result types can be the classes that extend RequestEvents base class (see classes below).
     */
    addRequestedResult(requestEvents: RequestEvents): void;
    /**
     * Set the single result type that you would like to be returned. Any previously set result types will be overwritten.
     * Result types can be the classes that extend RequestEvent base class (see classes below).
     */
    setRequestedResult(requestEvents: RequestEvents): void;
    /**
     * Set a custom list of event uris. The results will be then computed on this list - no query will be done (all conditions will be ignored).
     */
    static initWithEventUriList(uriList: string[]): QueryEvents;
    static initWithComplexQuery(query: QueryEvents, complexQuery: any): QueryEvents;
}
/**
 * @class QueryEventsIter
 * Class for iterating through all the events via callbacks
 */
export declare class QueryEventsIter extends QueryEvents {
    private er;
    private uriPage;
    private uriWgtList;
    private allUriPages;
    private eventBatchSize;
    private returnedDataSize;
    private sortBy;
    private sortByAsc;
    private returnInfo;
    private maxItems;
    constructor(er: EventRegistry, args?: ER.QueryEvents.IteratorArguments);
    /**
     * Execute query and fetch batches of articles of the specified size (eventBatchSize)
     * @param callback callback function that'll be called every time we get a new batch of events from the backend
     * @param doneCallback callback function that'll be called when everything is complete
     */
    execQuery(callback: (item, error) => void, doneCallback?: (error) => void): void;
    static initWithComplexQuery(query: any, complexQuery: any): any;
    private getNextUriPage();
    private readonly batchSize;
    private getNextBatch(callback, doneCallback);
}
export declare class RequestEvents {
}
/**
 * @class RequestEventsInfo
 * Return event details for resulting events.
 */
export declare class RequestEventsInfo extends RequestEvents {
    resultType: string;
    params: any;
    constructor(args?: ER.QueryEvents.RequestEventsInfoArguments);
}
/**
 * @class RequestEventsUriList
 * Return a simple list of event uris for resulting events.
 */
export declare class RequestEventsUriList extends RequestEvents {
    resultType: string;
    params: any;
    constructor(args?: ER.QueryEvents.RequestEventsUriListArguments);
    page: any;
}
/**
 * @class RequestEventsUriList
 * Return a simple list of event uris together with the scores for resulting events.
 */
export declare class RequestEventsUriWgtList extends RequestEvents {
    resultType: string;
    params: any;
    constructor(args?: ER.QueryEvents.RequestEventsUriWgtListArguments);
    page: any;
}
/**
 * @class RequestEventsTimeAggr
 * Return time distribution of resulting events.
 */
export declare class RequestEventsTimeAggr extends RequestEvents {
    resultType: string;
}
/**
 * Return keyword aggregate (tag cloud) on words in articles in resulting events.
 * @class RequestEventsTimeAggr
 */
export declare class RequestEventsKeywordAggr extends RequestEvents {
    resultType: string;
    params: any;
    constructor(lang?: string);
}
/**
 * @class RequestEventsLocAggr
 * Return aggregate of locations of resulting events.
 */
export declare class RequestEventsLocAggr extends RequestEvents {
    resultType: string;
    params: any;
    constructor(args?: ER.QueryEvents.RequestEventsLocAggrArguments);
}
/**
 * @class RequestEventsLocTimeAggr
 * Return aggregate of locations and times of resulting events.
 */
export declare class RequestEventsLocTimeAggr extends RequestEvents {
    resultType: string;
    params: any;
    constructor(args?: ER.QueryEvents.RequestEventsLocTimeAggrArguments);
}
/**
 * @class RequestEventsConceptAggr
 * Compute which concept are the most frequently occurring in the list of resulting events.
 */
export declare class RequestEventsConceptAggr extends RequestEvents {
    resultType: string;
    params: any;
    constructor(args?: ER.QueryEvents.RequestEventsConceptAggrArguments);
}
/**
 * @class RequestEventsConceptGraph
 * Compute which concept pairs frequently co-occur together in the resulting events.
 */
export declare class RequestEventsConceptGraph extends RequestEvents {
    resultType: string;
    params: any;
    constructor(args?: ER.QueryEvents.RequestEventsConceptGraphArguments);
}
/**
 * @class RequestEventsConceptMatrix
 * Get a matrix of concepts and their dependencies.
 * For individual concept pairs return how frequently
 * they co-occur in the resulting events and how "surprising" this is,
 * based on the frequency of individual concepts.
 */
export declare class RequestEventsConceptMatrix extends RequestEvents {
    resultType: string;
    params: any;
    constructor(args?: ER.QueryEvents.RequestEventsConceptMatrixArguments);
}
/**
 * @class RequestEventsConceptTrends
 * Return a list of top trending concepts and their daily trending info over time
 */
export declare class RequestEventsConceptTrends extends RequestEvents {
    resultType: string;
    params: any;
    constructor(args?: ER.QueryEvents.RequestEventsConceptTrendsArguments);
}
/**
 * @class RequestEventsSourceAggr
 * Return top news sources that report about the events that match the search conditions
 */
export declare class RequestEventsSourceAggr extends RequestEvents {
    resultType: string;
    params: any;
    constructor(args?: ER.QueryEvents.RequestEventsSourceAggrArguments);
}
/**
 * @class RequestEventsDateMentionAggr
 * Return events and the dates that are mentioned in articles about these events
 */
export declare class RequestEventsDateMentionAggr extends RequestEvents {
    resultType: string;
    params: any;
    constructor(args?: ER.QueryEvents.RequestEventsDateMentionAggrArguments);
}
/**
 * @class RequestEventsEventClusters
 * Return hierarchical clustering of events into smaller clusters. 2-means clustering is applied on each node in the tree
 */
export declare class RequestEventsEventClusters extends RequestEvents {
    resultType: string;
    params: any;
    constructor(args?: ER.QueryEvents.RequestEventsEventClustersArguments);
}
/**
 * @class RequestEventsCategoryAggr
 * Return distribution of events into dmoz categories.
 */
export declare class RequestEventsCategoryAggr extends RequestEvents {
    resultType: string;
    params: any;
    constructor(returnInfo?: ReturnInfo);
}
/**
 * @class RequestEventsRecentActivity
 * Return a list of recently changed events that match search conditions.
 */
export declare class RequestEventsRecentActivity extends RequestEvents {
    resultType: string;
    params: any;
    constructor(args?: ER.QueryEvents.RequestEventsRecentActivityArguments);
}
