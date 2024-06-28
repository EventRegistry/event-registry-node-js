import { Query, QueryParamsBase } from "./base";
import { Data } from "./data";
import { EventRegistry } from "./eventRegistry";
import { ComplexEventQuery } from "./query";
import { ReturnInfo } from "./returnInfo";
import { ER } from "./types";
import { Logger } from "./logger";

/**
 * @class QueryEvents
 * Class for obtaining available info for one or more events in the Event Registry
 */
export class QueryEvents extends Query<RequestEvents> {
    public params = {};
    constructor(args: ER.QueryEvents.Arguments = {}) {
        super();
        const {
            keywords,
            conceptUri,
            categoryUri,
            sourceUri,
            sourceLocationUri,
            sourceGroupUri,
            authorUri,
            locationUri,
            lang,
            dateStart,
            dateEnd,
            reportingDateStart,
            reportingDateEnd,
            minSentiment = -1,
            maxSentiment = 1,
            minArticlesInEvent,
            maxArticlesInEvent,
            dateMentionStart,
            dateMentionEnd,
            ignoreKeywords,
            ignoreConceptUri,
            ignoreCategoryUri,
            ignoreSourceUri,
            ignoreSourceLocationUri,
            ignoreSourceGroupUri,
            ignoreAuthorUri,
            ignoreLocationUri,
            ignoreLang,
            keywordsLoc = "body",
            ignoreKeywordsLoc = "body",
            keywordSearchMode = "phrase",
            ignoreKeywordSearchMode = "phrase",
            categoryIncludeSub = true,
            ignoreCategoryIncludeSub = true,
            requestedResult = new RequestEventsInfo(),
        } = args;

        this.setVal("action", "getEvents");
        this.setQueryArrVal(keywords, "keyword", "keywordOper", "and");
        this.setQueryArrVal(conceptUri, "conceptUri", "conceptOper", "and");
        this.setQueryArrVal(categoryUri, "categoryUri", "categoryOper", "or");
        this.setQueryArrVal(sourceUri, "sourceUri", undefined, "or");
        this.setQueryArrVal(sourceLocationUri, "sourceLocationUri", undefined, "or");
        this.setQueryArrVal(sourceGroupUri, "sourceGroupUri", undefined, "or");
        this.setQueryArrVal(authorUri, "authorUri", "authorOper", "or");
        this.setQueryArrVal(locationUri, "locationUri", undefined, "or");
        this.setQueryArrVal(lang, "lang", undefined, "or");
        if (dateStart !== undefined) {
            this.setDateVal("dateStart", dateStart);
        }
        if (dateEnd !== undefined) {
            this.setDateVal("dateEnd", dateEnd);
        }
        if (reportingDateStart !== undefined) {
            this.setDateVal("reportingDateStart", reportingDateStart);
        }
        if (reportingDateEnd !== undefined) {
            this.setDateVal("reportingDateEnd", reportingDateEnd);
        }

        if (minSentiment > -1 && minSentiment <= 1 ) {
            this.setVal("minSentiment", minSentiment);
        }

        if (maxSentiment >= -1 && maxSentiment < 1 ) {
            this.setVal("maxSentiment", maxSentiment);
        }

        this.setValIfNotDefault("minArticlesInEvent", minArticlesInEvent, undefined);
        this.setValIfNotDefault("maxArticlesInEvent", maxArticlesInEvent, undefined);

        if (dateMentionStart !== undefined) {
            this.setDateVal("dateMentionStart", dateMentionStart);
        }
        if (dateMentionEnd !== undefined) {
            this.setDateVal("dateMentionEnd", dateMentionEnd);
        }

        // for the negative conditions, only the OR is a valid operator type
        this.setQueryArrVal(ignoreKeywords, "ignoreKeywords", undefined, "or");
        this.setQueryArrVal(ignoreConceptUri, "ignoreConceptUri", undefined, "or");
        this.setQueryArrVal(ignoreCategoryUri, "ignoreCategoryUri", undefined, "or");
        this.setQueryArrVal(ignoreSourceUri, "ignoreSourceUri", undefined, "or");
        this.setQueryArrVal(ignoreSourceLocationUri, "ignoreSourceLocationUri", undefined, "or");
        this.setQueryArrVal(ignoreSourceGroupUri, "ignoreSourceGroupUri", undefined, "or");
        this.setQueryArrVal(ignoreAuthorUri, "ignoreAuthorUri", undefined, "or");
        this.setQueryArrVal(ignoreLocationUri, "ignoreLocationUri", undefined, "or");

        this.setQueryArrVal(ignoreLang, "ignoreLang", undefined, "or");

        this.setValIfNotDefault("keywordLoc", keywordsLoc, "body");
        this.setValIfNotDefault("ignoreKeywordLoc", ignoreKeywordsLoc, "body");
        this.setValIfNotDefault("keywordSearchMode", keywordSearchMode, "phrase");
        this.setValIfNotDefault("ignoreKeywordSearchMode", ignoreKeywordSearchMode, "phrase");
        this.setValIfNotDefault("categoryIncludeSub", categoryIncludeSub, true);
        this.setValIfNotDefault("ignoreCategoryIncludeSub", ignoreCategoryIncludeSub, true);
        this.setRequestedResult(requestedResult);
    }

    public get path() {
        return "/api/v1/event";
    }

    /**
     * Set the single result type that you would like to be returned. Any previously set result types will be overwritten.
     * Result types can be the classes that extend RequestEvent base class (see classes below).
     */
    public setRequestedResult(requestEvents: RequestEvents) {
        if (!(requestEvents instanceof RequestEvents)) {
            throw new Error("QueryEvents class can only accept result requests that are of type RequestEvents");
        }
        this.resultTypeList = [
            requestEvents,
        ];
    }
    /**
     * Set a custom list of event uris. The results will be then computed on this list - no query will be done (all conditions will be ignored).
     */
    public static initWithEventUriList(uriList: string[]) {
        const query = new QueryEvents();
        if (!Array.isArray(uriList)) {
            throw new Error("uriList has to be a list of strings that represent event uris");
        }
        query.params = {
            action: "getEvents",
            eventUriList: uriList.join(","),
        };
        return query;
    }

    /**
     * Set a custom list of event uris. The results will be then computed on this list - no query will be done (all conditions will be ignored).
     */
    public static initWithEventUriWgtList(...args);
    public static initWithEventUriWgtList(uriWgtList: string[]) {
        const query = new QueryEvents();
        if (!Array.isArray(uriWgtList)) {
            throw new Error("uriWgtList has to be a list of strings that represent event uris");
        }
        query.params = {
            action: "getEvents",
            eventUriWgtList: uriWgtList.join(","),
        };
        return query;
    }

    public static initWithComplexQuery(...args);
    public static initWithComplexQuery(complexQuery) {
        const query = new QueryEvents();
        if (complexQuery instanceof ComplexEventQuery) {
            query.setVal("query", JSON.stringify(complexQuery.getQuery()));
        } else if (typeof complexQuery === 'string') {
            try {
                JSON.parse(complexQuery);
            } catch {
                Logger.error("Failed to parse the provided string content as a JSON object. Please check the content provided as a parameter to the initWithComplexQuery() method");
            }
            query.setVal("query", complexQuery);
        } else if (typeof complexQuery === 'object' && complexQuery !== null) {
            query.setVal("query", JSON.stringify(complexQuery));
        } else {
            throw new Error("The instance of query parameter was not a ComplexEventQuery, a string or an object");
        }
        return query;
    }
}

/**
 * @class QueryEventsIter
 * Class for iterating through all the events via callbacks
 */
export class QueryEventsIter extends QueryEvents implements AsyncIterable<Data.Event> {
    private readonly er: EventRegistry;
    private readonly sortBy: "none" | "rel" | "date" | "size" | "socialScore";
    private readonly sortByAsc: boolean;
    private readonly returnInfo: ReturnInfo;
    private readonly maxItems: number;
    private page: number = 0;
    private pages: number = 1;
    private items: Data.Event[] = [];
    private returnedSoFar: number = 0;
    private index: number = 0;
    private callback: (item: Data.Event) => void = () => undefined;
    private doneCallback: (error?: string) => void = () => undefined;
    private errorMessage: string;

    constructor(er: EventRegistry, args: ER.QueryEvents.IteratorArguments = {}) {
        super(args as ER.QueryEvents.Arguments);
        const {
            sortBy = "rel",
            sortByAsc = false,
            returnInfo = undefined,
            maxItems = -1,
        } = args;
        this.er = er;
        this.sortBy = sortBy;
        this.sortByAsc = sortByAsc;
        this.returnInfo = returnInfo;
        this.maxItems = maxItems;
    }

    /**
     * Async Iterator function that returns the next item in the list of events
     */
    [Symbol.asyncIterator](): AsyncIterator<Data.Event> {
        return {
            next: async () => {
                if (this.index >= this.items.length) {
                    await this.getNextBatch();
                }
                const item = this.items[this.index];
                this.index++;
                return {value: item, done: !item};
            },
        };
    }

    public async count(): Promise<number> {
        this.setRequestedResult(new RequestEventsInfo());
        const response = await this.er.execQuery(this);
        if (response?.error) {
            this.er.logger.error(response.error);
        }
        return (response?.events as ER.Results)?.totalResults || 0;
    }

    /**
     * Execute query and fetch batches of events of the specified size (eventBatchSize)
     * @param callback callback function that'll be called every time we get a new batch of events from the backend
     * @param doneCallback callback function that'll be called when everything is complete
     */
    public execQuery(callback: (item: Data.Event) => void, doneCallback?: (error?: string) => void): void {
        if (callback) { this.callback = callback; }
        if (doneCallback) { this.doneCallback = doneCallback; }
        this.iterate();
    }

    public static initWithComplexQuery(er, complexQuery, args: ER.QueryEvents.IteratorArguments = {}) {
        const query = new QueryEventsIter(er, args);
        if (complexQuery instanceof ComplexEventQuery) {
            query.setVal("query", JSON.stringify(complexQuery.getQuery()));
        } else if (typeof complexQuery === "string") {
            query.setVal("query", complexQuery);
        } else if (typeof complexQuery === "object" && complexQuery !== null) {
            query.setVal("query", JSON.stringify(complexQuery));
        } else {
            throw new Error("The instance of query parameter was not a ComplexEventQuery, a string or an object");
        }
        return query;
    }

    private async iterate() {
        if (this.current) {
            this.callback(this.current);
            this.index += 1;
        } else if (!await this.getNextBatch()) {
            this.doneCallback(this.errorMessage);
            return;
        }
        return this.iterate();
    }

    /**
     * Extract the results according to maxItems
     * @param response response from the backend
     */
    private extractResults(response): Data.Event[] {
        const results = response?.events?.results || [];
        const extractedSize = this.maxItems !== -1 ? this.maxItems - this.returnedSoFar : results.length;
        return results.slice(0, extractedSize).filter(Boolean);
    }

    private get current() {
        return this.items[this.index] || undefined;
    }

    private async getNextBatch() {
        try {
            this.page += 1;
            if (this.page > this.pages || (this.maxItems !== -1 && this.returnedSoFar >= this.maxItems)) {
                return false;
            }
            const requestEventsInfo = new RequestEventsInfo({
                page: this.page,
                count: 50,
                sortBy: this.sortBy,
                sortByAsc: this.sortByAsc,
                returnInfo: this.returnInfo,
            });
            this.setRequestedResult(requestEventsInfo);
            if (this.er.verboseOutput) {
                this.er.logger.info(`Downloading event page ${this.page}...`);
            }
            const response = await this.er.execQuery(this, this.er.allowUseOfArchive);
            const error = response.error || "";
            if (error) {
                this.errorMessage = `Error while obtaining a list of events:  ${response.error}`;
            } else {
                this.pages = (response.events as ER.Results)?.pages || 0;
            }
            const results = this.extractResults(response);
            this.returnedSoFar += results.length;
            this.items = [...this.items, ...results];
            return true;
        } catch (error) {
            this.er.logger.error(error);
            return false;
        }
    }
}

export class RequestEvents {}

/**
 * @class RequestEventsInfo
 * Return event details for resulting events.
 */
export class RequestEventsInfo extends RequestEvents {
    public resultType = "events";
    public params;
    constructor(args: ER.QueryEvents.RequestEventsInfoArguments = {}) {
        super();
        const {
            page = 1,
            count = 50,
            sortBy = "rel",
            sortByAsc = false,
            returnInfo = undefined,
        } = args;
        if (page < 1) {
            throw new RangeError("Page has to be >= 1");
        }
        if (count > 50) {
            throw new RangeError("At most 50 events can be returned per call");
        }
        this.params = {};
        this.params["eventsPage"] = page;
        this.params["eventsCount"] = count;
        this.params["eventsSortBy"] = sortBy;
        this.params["eventsSortByAsc"] = sortByAsc;
        if (!!returnInfo) {
            this.params = {...this.params, ...returnInfo.getParams("events")};
        }
    }
}

/**
 * @class RequestEventsUriList
 * Return a simple list of event uris together with the scores for resulting events.
 */
export class RequestEventsUriWgtList extends RequestEvents {
    public resultType = "uriWgtList";
    public params;

    constructor(args: ER.QueryEvents.RequestEventsUriWgtListArguments = {}) {
        super();
        const {
            page = 1,
            count = 50000,
            sortBy = "rel",
            sortByAsc = false,
            ...unsupported
        } = args;
        if (Object.keys(unsupported).length !== 0) {
            Logger.warn(`RequestEventsUriWgtList: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        if (page < 1) {
            throw new RangeError("Page has to be >= 1");
        }
        if (count > 100000) {
            throw new RangeError("At most 100000 results can be returned per call");
        }
        this.params = {};
        this.params["uriWgtListPage"] = page;
        this.params["uriWgtListCount"] = count;
        this.params["uriWgtListSortBy"] = sortBy;
        this.params["uriWgtListSortByAsc"] = sortByAsc;
    }

    public set page(page: number) {
        if (page < 1) {
            throw new RangeError("Page has to be >= 1");
        }
        this.params["uriWgtListPage"] = page;
    }
}

/**
 * @class RequestEventsTimeAggr
 * Return time distribution of resulting events.
 */
export class RequestEventsTimeAggr extends RequestEvents {
    public resultType = "timeAggr";
}

/**
 * Return keyword aggregate (tag cloud) on words in articles in resulting events.
 * @class RequestEventsTimeAggr
 */
export class RequestEventsKeywordAggr extends RequestEvents {
    public resultType = "keywordAggr";
    public params;
    /**
     * @param lang: in which language to produce the list of top keywords. If undefined, then compute on all articles
     */
    constructor(lang?) {
        super();
        this.params = {};
        if (lang !== undefined) {
            this.params["keywordAggrLang"] = lang;
        }
    }
}

/**
 * @class RequestEventsLocAggr
 * Return aggregate of locations of resulting events.
 */
export class RequestEventsLocAggr extends RequestEvents {
    public resultType = "locAggr";
    public params;
    constructor(args: ER.QueryEvents.RequestEventsLocAggrArguments = {}) {
        super();
        const {
            eventsSampleSize = 100000,
            returnInfo = new ReturnInfo(),
            ...unsupported
        } = args;
        if (Object.keys(unsupported).length !== 0) {
            Logger.warn(`RequestEventsLocAggr: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        if (eventsSampleSize > 100000) {
            throw new RangeError("At most 100000 results can be used for computing");
        }
        this.params = {};
        this.params["locAggrSampleSize"] = eventsSampleSize;
        this.params = {...this.params, ...returnInfo.getParams("locAggr")};
    }
}

/**
 * @class RequestEventsLocTimeAggr
 * Return aggregate of locations and times of resulting events.
 */
export class RequestEventsLocTimeAggr extends RequestEvents {
    public resultType = "locTimeAggr";
    public params;
    constructor(args: ER.QueryEvents.RequestEventsLocTimeAggrArguments = {}) {
        super();
        const {
            eventsSampleSize = 100000,
            returnInfo = new ReturnInfo(),
            ...unsupported
        } = args;
        if (Object.keys(unsupported).length !== 0) {
            Logger.warn(`RequestEventsLocTimeAggr: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        if (eventsSampleSize > 100000) {
            throw new RangeError("At most 100000 results can be used for computing");
        }
        this.params = {};
        this.params["locTimeAggrSampleSize"] = eventsSampleSize;
        this.params = {...this.params, ...returnInfo.getParams("locTimeAggr")};
    }
}

/**
 * @class RequestEventsConceptAggr
 * Compute which concept are the most frequently occurring in the list of resulting events.
 */
export class RequestEventsConceptAggr extends RequestEvents {
    public resultType = "conceptAggr";
    public params;
    constructor(args: ER.QueryEvents.RequestEventsConceptAggrArguments = {}) {
        super();
        const { conceptCount = 20, eventsSampleSize = 100000, returnInfo = new ReturnInfo() } = args;
        if (conceptCount > 200) {
            throw new RangeError("At most 200 top concepts can be returned");
        }
        if (eventsSampleSize > 300000) {
            throw new RangeError("At most 300000 results can be used for computing");
        }
        this.params = {};
        this.params["conceptAggrConceptCount"] = conceptCount;
        this.params["conceptAggrSampleSize"] = eventsSampleSize;
        this.params = {...this.params, ...returnInfo.getParams("conceptAggr")};
    }
}

/**
 * @class RequestEventsConceptGraph
 * Compute which concept pairs frequently co-occur together in the resulting events.
 */
export class RequestEventsConceptGraph extends RequestEvents {
    public resultType = "conceptGraph";
    public params;
    constructor(args: ER.QueryEvents.RequestEventsConceptGraphArguments = {}) {
        super();
        const { conceptCount = 25, linkCount = 150, eventsSampleSize = 50000, returnInfo = new ReturnInfo() } = args;
        if (conceptCount > 1000) {
            throw new RangeError("At most 1000 top concepts can be returned");
        }
        if (linkCount > 2000) {
            throw new RangeError("At most 2000 links between concepts can be returned");
        }
        if (eventsSampleSize > 300000) {
            throw new RangeError("At most 300000 results can be used for computing");
        }
        this.params = {};
        this.params["conceptGraphConceptCount"] = conceptCount;
        this.params["conceptGraphLinkCount"] = linkCount;
        this.params["conceptGraphSampleSize"] = eventsSampleSize;
        this.params = {...this.params, ...returnInfo.getParams("conceptGraph")};
    }
}

/**
 * @class RequestEventsConceptMatrix
 * Get a matrix of concepts and their dependencies.
 * For individual concept pairs return how frequently
 * they co-occur in the resulting events and how "surprising" this is,
 * based on the frequency of individual concepts.
 */
export class RequestEventsConceptMatrix extends RequestEvents {
    public resultType = "conceptMatrix";
    public params;
    constructor(args: ER.QueryEvents.RequestEventsConceptMatrixArguments = {}) {
        super();
        const { conceptCount = 25, measure = "pmi", eventsSampleSize = 100000, returnInfo = new ReturnInfo() } = args;
        if (conceptCount > 200) {
            throw new RangeError("At most 200 top concepts can be returned");
        }
        if (eventsSampleSize > 300000) {
            throw new RangeError("At most 300000 results can be used for computing");
        }
        this.params = {};
        this.params["conceptMatrixConceptCount"] = conceptCount;
        this.params["conceptMatrixMeasure"] = measure;
        this.params["conceptMatrixSampleSize"] = eventsSampleSize;
        this.params = {...this.params, ...returnInfo.getParams("conceptMatrix")};
    }
}

/**
 * @class RequestEventsConceptTrends
 * Return a list of top trending concepts and their daily trending info over time
 */
export class RequestEventsConceptTrends extends RequestEvents {
    public resultType = "conceptTrends";
    public params;
    constructor(args: ER.QueryEvents.RequestEventsConceptTrendsArguments = {}) {
        super();
        const { conceptCount = 10, conceptUris = [], returnInfo = new ReturnInfo() } = args;
        if (conceptCount > 50) {
            throw new RangeError("At most 50 top concepts can be returned");
        }
        this.params = {};
        this.params["conceptTrendsConceptCount"] = conceptCount;
        if (conceptUris.length > 0) {
            this.params["conceptTrendsConceptUri"] = conceptUris;
        }
        this.params = {...this.params, ...returnInfo.getParams("conceptTrends")};
    }
}

/**
 * @class RequestEventsSourceAggr
 * Return top news sources that report about the events that match the search conditions
 */
export class RequestEventsSourceAggr extends RequestEvents {
    public resultType = "sourceAggr";
    public params;
    constructor(args: ER.QueryEvents.RequestEventsSourceAggrArguments = {}) {
        super();
        const { sourceCount = 30, eventsSampleSize = 50000, returnInfo = new ReturnInfo() } = args;
        if (sourceCount > 200) {
            throw new RangeError("At most 200 top sources can be returned");
        }
        if (eventsSampleSize > 100000) {
            throw new RangeError("At most 100000 results can be used for computing");
        }
        this.params = {};
        this.params["sourceAggrSourceCount"] = sourceCount;
        this.params["sourceAggrSampleSize"] = eventsSampleSize;
        this.params = {...this.params, ...returnInfo.getParams("sourceAggr")};
    }
}

/**
 * @class RequestEventsDateMentionAggr
 * Return events and the dates that are mentioned in articles about these events
 */
export class RequestEventsDateMentionAggr extends RequestEvents {
    public resultType = "dateMentionAggr";
    public params;
    constructor(args: ER.QueryEvents.RequestEventsDateMentionAggrArguments = {}) {
        super();
        const {
            minDaysApart = 0,
            minDateMentionCount = 5,
            eventsSampleSize = 100000,
            returnInfo = new ReturnInfo(),
        } = args;
        if (eventsSampleSize > 300000) {
            throw new RangeError("At most 300000 results can be used for computing");
        }
        this.params = {};
        this.params["dateMentionAggrMinDaysApart"] = minDaysApart;
        this.params["dateMentionAggrMinDateMentionCount"] = minDateMentionCount;
        this.params["dateMentionAggrSampleSize"] = eventsSampleSize;
        this.params = {...this.params, ...returnInfo.getParams("dateMentionAggr")};
    }
}

/**
 * @class RequestEventsEventClusters
 * Return hierarchical clustering of events into smaller clusters. 2-means clustering is applied on each node in the tree
 */
export class RequestEventsEventClusters extends RequestEvents {
    public resultType = "eventClusters";
    public params;
    constructor(args: ER.QueryEvents.RequestEventsEventClustersArguments = {}) {
        super();
        const { keywordCount = 30, maxEventsToCluster = 10000, returnInfo = new ReturnInfo() } = args;
        if (keywordCount > 100) {
            throw new RangeError("At most 100 keywords can be reported in each of the clusters");
        }
        if (maxEventsToCluster > 10000) {
            throw new RangeError("At most 10000 events can be clustered together");
        }
        this.params = {};
        this.params["eventClustersKeywordCount"] = keywordCount;
        this.params["eventClustersMaxEventsToCluster"] = maxEventsToCluster;
        this.params = {...this.params, ...returnInfo.getParams("eventClusters")};
    }
}

/**
 * @class RequestEventsCategoryAggr
 * Return distribution of events into dmoz categories.
 */
export class RequestEventsCategoryAggr extends RequestEvents {
    public resultType = "categoryAggr";
    public params;
    constructor(returnInfo = new ReturnInfo()) {
        super();
        this.params = returnInfo.getParams("categoryAggr");
    }
}

/**
 * @class RequestEventsRecentActivity
 * Return a list of recently changed events that match search conditions.
 */
export class RequestEventsRecentActivity extends RequestEvents {
    public resultType = "recentActivityEvents";
    public params;
    constructor(args: ER.QueryEvents.RequestEventsRecentActivityArguments = {}) {
        super();
        const {
            maxEventCount = 50,
            updatesAfterTm,
            updatesAfterMinsAgo,
            mandatoryLocation = true,
            minAvgCosSim = 0,
            returnInfo = undefined,
        } = args;
        if (maxEventCount > 2000) {
            throw new RangeError("At most 2000 events can be returned");
        }
        if (updatesAfterTm !== undefined && updatesAfterMinsAgo !== undefined) {
            throw new Error("You should specify either updatesAfterTm or updatesAfterMinsAgo parameter, but not both");
        }
        this.params = {};
        this.params["recentActivityEventsMaxEventCount"] = maxEventCount;
        this.params["recentActivityEventsMandatoryLocation"] = mandatoryLocation;

        if (updatesAfterTm !== undefined) {
            this.params["recentActivityEventsUpdatesAfterTm"] = QueryParamsBase.encodeDateTime(updatesAfterTm);
        }

        if (updatesAfterMinsAgo !== undefined) {
            this.params["recentActivityEventsUpdatesAfterMinsAgo"] = updatesAfterMinsAgo;
        }

        this.params["recentActivityEventsMinAvgCosSim"] = minAvgCosSim;
        if (!!returnInfo) {
            this.params = {...this.params, ...returnInfo.getParams("recentActivityEvents")};
        }
    }
}
