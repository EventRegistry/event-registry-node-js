import * as _ from "lodash";
import { Query, QueryParamsBase } from "./base";
import { EventRegistry } from "./eventRegistry";
import { ComplexEventQuery } from "./query";
import { ReturnInfo } from "./returnInfo";
import { ER } from "./types";

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
            locationUri,
            lang,
            dateStart,
            dateEnd,
            minArticlesInEvent = 0,
            maxArticlesInEvent = Number.MAX_SAFE_INTEGER, // in place of Python's `sys.maxsize`
            dateMentionStart,
            dateMentionEnd,
            ignoreKeywords,
            ignoreConceptUri,
            ignoreCategoryUri,
            ignoreSourceUri,
            ignoreSourceLocationUri,
            ignoreSourceGroupUri,
            ignoreLocationUri,
            ignoreLang,
            keywordsLoc = "body",
            ignoreKeywordsLoc = "body",
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
        this.setQueryArrVal(locationUri, "locationUri", undefined, "or");
        this.setQueryArrVal(lang, "lang", undefined, "or");
        if (!_.isUndefined(dateStart)) {
            this.setDateVal("dateStart", dateStart);
        }

        if (!_.isUndefined(dateEnd)) {
            this.setDateVal("dateEnd", dateEnd);
        }

        this.setValIfNotDefault("minArticlesInEvent", minArticlesInEvent, 0);
        this.setValIfNotDefault("maxArticlesInEvent", maxArticlesInEvent, Number.MAX_SAFE_INTEGER);

        if (!_.isUndefined(dateMentionStart)) {
            this.setDateVal("dateMentionStart", dateMentionStart);
        }

        if (!_.isUndefined(dateMentionEnd)) {
            this.setDateVal("dateMentionEnd", dateMentionEnd);
        }

        // for the negative conditions, only the OR is a valid operator type
        this.setQueryArrVal(ignoreKeywords, "ignoreKeywords", undefined, "or");
        this.setQueryArrVal(ignoreConceptUri, "ignoreConceptUri", undefined, "or");
        this.setQueryArrVal(ignoreCategoryUri, "ignoreCategoryUri", undefined, "or");
        this.setQueryArrVal(ignoreSourceUri, "ignoreSourceUri", undefined, "or");
        this.setQueryArrVal(ignoreLocationUri, "ignoreLocationUri", undefined, "or");

        this.setQueryArrVal(ignoreLang, "ignoreLang", undefined, "or");

        this.setValIfNotDefault("keywordLoc", keywordsLoc, "body");
        this.setValIfNotDefault("ignoreKeywordLoc", ignoreKeywordsLoc, "body");

        this.setValIfNotDefault("categoryIncludeSub", categoryIncludeSub, true);
        this.setValIfNotDefault("ignoreCategoryIncludeSub", ignoreCategoryIncludeSub, true);
        this.setRequestedResult(requestedResult);
    }

    public get path() {
        return "/json/event";
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
        if (!_.isArray(uriList)) {
            throw new Error("uriList has to be a list of strings that represent event uris");
        }
        query.params = {
            action: "getEvents",
            eventUriList: _.join(uriList, ","),
        };
        return query;
    }

    /**
     * Set a custom list of event uris. The results will be then computed on this list - no query will be done (all conditions will be ignored).
     */
    public static initWithEventUriWgtList(...args);
    public static initWithEventUriWgtList(uriWgtList: string[]) {
        const query = new QueryEvents();
        if (!_.isArray(uriWgtList)) {
            throw new Error("uriWgtList has to be a list of strings that represent event uris");
        }
        query.params = {
            action: "getEvents",
            eventUriWgtList: _.join(uriWgtList, ","),
        };
        return query;
    }

    public static initWithComplexQuery(...args);
    public static initWithComplexQuery(complexQuery) {
        const query = new QueryEvents();
        if (complexQuery instanceof ComplexEventQuery) {
            query.setVal("query", JSON.stringify(complexQuery.getQuery()));
        } else if (_.isString(complexQuery)) {
            query.setVal("query", complexQuery);
        } else if (_.isObject(complexQuery)) {
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
export class QueryEventsIter extends QueryEvents {
    private er: EventRegistry;
    private uriPage = 0;
    private uriWgtList;
    private allUriPages;
    private eventBatchSize;
    private returnedDataSize;
    private sortBy;
    private sortByAsc;
    private returnInfo;
    private maxItems;

    constructor(er: EventRegistry, args: ER.QueryEvents.IteratorArguments = {}) {
        super(args as ER.QueryEvents.Arguments);
        const {
            sortBy = "rel",
            sortByAsc = false,
            returnInfo = new ReturnInfo(),
            eventBatchSize = 50,
            maxItems = -1,
        } = args;
        if (eventBatchSize > 50) {
            throw new Error("Batch size should not exceed 50");
        }
        this.er = er;
        this.sortBy = sortBy;
        this.sortByAsc = sortByAsc;
        this.returnInfo = returnInfo;
        this.eventBatchSize = eventBatchSize;
        this.maxItems = maxItems;
    }

    public async count() {
        this.setRequestedResult(new RequestEventsUriWgtList());
        const response = await this.er.execQuery(this);
        if (_.has(response, "error")) {
            console.error(_.get(response, "error"));
        }
        return _.get(response, "uriWgtList.totalResults", 0);
    }

    /**
     * Execute query and fetch batches of articles of the specified size (eventBatchSize)
     * @param callback callback function that'll be called every time we get a new batch of events from the backend
     * @param doneCallback callback function that'll be called when everything is complete
     */
    public execQuery(callback: (item, error) => void, doneCallback?: (error) => void) {
        this.getNextBatch(callback, doneCallback);
    }

    public static initWithComplexQuery(er, complexQuery, args: ER.QueryEvents.IteratorArguments = {}) {
        const query = new QueryEventsIter(er, args);
        if (complexQuery instanceof ComplexEventQuery) {
            query.setVal("query", JSON.stringify(complexQuery.getQuery()));
        } else if (_.isString(complexQuery)) {
            query.setVal("query", complexQuery);
        } else if (_.isObject(complexQuery)) {
            query.setVal("query", JSON.stringify(complexQuery));
        } else {
            throw new Error("The instance of query parameter was not a ComplexEventQuery, a string or an object");
        }
        return query;
    }

    private async getNextUriPage() {
        this.uriPage++;
        this.uriWgtList = [];
        if (!this.allUriPages && this.uriPage > this.allUriPages) {
            return;
        }
        const requestEventsUriWgtList = new RequestEventsUriWgtList({page: this.uriPage, sortBy: this.sortBy, sortByAsc: this.sortByAsc});
        this.setRequestedResult(requestEventsUriWgtList);
        const res = await this.er.execQuery(this);
        this.uriWgtList = _.get(res, "uriWgtList.results", []);
        this.allUriPages = _.get(res, "uriWgtList.pages", 0);
    }

    private get batchSize() {
        if (this.maxItems === -1) {
            return this.eventBatchSize;
        }
        const toReturnSize = this.maxItems - this.returnedDataSize;
        return toReturnSize < this.eventBatchSize ? toReturnSize : this.eventBatchSize;
    }

    private async getNextBatch(callback, doneCallback) {
        if (_.isEmpty(this.uriWgtList)) {
            await this.getNextUriPage();
        }
        if (_.isEmpty(this.uriWgtList) || (this.maxItems !== -1 && this.maxItems === this.returnedDataSize)) {
            if (doneCallback) {
                doneCallback();
            }
            return;
        }
        const uriWgts = _.compact(_.pullAt(this.uriWgtList, _.range(0, this.batchSize)));
        const q = QueryEvents.initWithEventUriWgtList(uriWgts);
        const requestEventsInfo = new RequestEventsInfo({count: this.batchSize, sortBy: "none", returnInfo: this.returnInfo});
        q.setRequestedResult(requestEventsInfo);
        const res = await this.er.execQuery(q);
        this.returnedDataSize += _.size(uriWgts);
        callback(_.get(res, "events.results"), _.get(res, "error"));
        if (this.uriPage <= this.allUriPages) {
            this.getNextBatch(callback, doneCallback);
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
        const { page = 1, count = 50, sortBy = "rel", sortByAsc = false, returnInfo = new ReturnInfo() } = args;
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
        this.params = _.extend({}, this.params, returnInfo.getParams("events"));
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
        const { page = 1, count = 50000, sortBy = "rel", sortByAsc = false } = args;
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

    public set page(page) {
        if (page < 1) {
            throw new RangeError("Page has to be >= 1");
        }
        _.set(this.params, "uriWgtListPage", page);
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
    constructor(lang = "eng") {
        super();
        this.params = {};
        this.params["keywordAggrLang"] = lang;
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
        const { eventsSampleSize = 100000, returnInfo = new ReturnInfo() } = args;
        if (eventsSampleSize > 100000) {
            throw new RangeError("At most 100000 results can be used for computing");
        }
        this.params = {};
        this.params["locAggrSampleSize"] = eventsSampleSize;
        this.params = _.extend({}, this.params, returnInfo.getParams("locAggr"));
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
        const { eventsSampleSize = 100000, returnInfo = new ReturnInfo() } = args;
        if (eventsSampleSize > 100000) {
            throw new RangeError("At most 100000 results can be used for computing");
        }
        this.params = {};
        this.params["locTimeAggrSampleSize"] = eventsSampleSize;
        this.params = _.extend({}, this.params, returnInfo.getParams("locTimeAggr"));
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
        this.params = _.extend({}, this.params, returnInfo.getParams("conceptAggr"));
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
        const { conceptCount = 25, linkCount = 50, eventsSampleSize = 100000, returnInfo = new ReturnInfo() } = args;
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
        this.params = _.extend({}, this.params, returnInfo.getParams("conceptGraph"));
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
        this.params = _.extend({}, this.params, returnInfo.getParams("conceptMatrix"));
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
        const { conceptCount = 10, returnInfo = new ReturnInfo() } = args;
        if (conceptCount > 50) {
            throw new RangeError("At most 50 top concepts can be returned");
        }
        this.params = {};
        this.params["conceptTrendsConceptCount"] = conceptCount;
        this.params = _.extend({}, this.params, returnInfo.getParams("conceptTrends"));
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
        const { sourceCount = 30, eventsSampleSize = 100000, returnInfo = new ReturnInfo() } = args;
        if (sourceCount > 200) {
            throw new RangeError("At most 200 top sources can be returned");
        }
        if (eventsSampleSize > 300000) {
            throw new RangeError("At most 300000 results can be used for computing");
        }
        this.params = {};
        this.params["sourceAggrSourceCount"] = sourceCount;
        this.params["sourceAggrSampleSize"] = eventsSampleSize;
        this.params = _.extend({}, this.params, returnInfo.getParams("sourceAggr"));
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
        this.params = _.extend({}, this.params, returnInfo.getParams("dateMentionAggr"));
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
        this.params = _.extend({}, this.params, returnInfo.getParams("eventClusters"));
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
    public resultType = "recentActivity";
    public params;
    constructor(args: ER.QueryEvents.RequestEventsRecentActivityArguments = {}) {
        super();
        const {
            maxEventCount = 50,
            updatesAfterTm,
            updatesAfterMinsAgo,
            mandatoryLocation = true,
            lang,
            minAvgCosSim = 0,
            returnInfo = new ReturnInfo(),
        } = args;
        if (maxEventCount > 200) {
            throw new RangeError("At most 200 events can be returned");
        }
        if (!_.isUndefined(updatesAfterTm) && !_.isUndefined(updatesAfterMinsAgo)) {
            throw new Error("You should specify either updatesAfterTm or updatesAfterMinsAgo parameter, but not both");
        }
        this.params["recentActivityEventsMaxEventCount"] = maxEventCount;
        this.params["recentActivityEventsMandatoryLocation"] = mandatoryLocation;

        if (!_.isUndefined(updatesAfterTm)) {
            this.params["recentActivityEventsUpdatesAfterTm"] = QueryParamsBase.encodeDateTime(updatesAfterTm);
        }

        if (!_.isUndefined(updatesAfterMinsAgo)) {
            this.params["recentActivityEventsUpdatesAfterMinsAgo"] = updatesAfterMinsAgo;
        }

        if (!_.isUndefined(lang)) {
            this.params["recentActivityEventsLang"] = lang;
        }

        this.params["recentActivityEventsMinAvgCosSim"] = minAvgCosSim;
        this.params = _.extend({}, this.params, returnInfo.getParams("recentActivityEvents"));
    }
}
