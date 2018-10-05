import * as _ from "lodash";
import { Query, QueryParamsBase } from "./base";
import { EventRegistry } from "./eventRegistry";
import { ArticleInfoFlags, ReturnInfo } from "./returnInfo";
import { EventRegistryStatic } from "./types";
/**
 * @class QueryEvent
 * Class for obtaining available info for one or more events in the Event Registry
 */
export class QueryEvent extends Query<RequestEvent> {
    /**
     * @param eventUriOrList A single event uri or a list of event uris (max 50)
     * @param requestedResult The information to return as the result of the query. By default return the details of the event
     */
    constructor(eventUriOrList: string | string[], requestedResult = new RequestEventInfo()) {
        super();
        this.setVal("eventUri", eventUriOrList);
        this.setRequestedResult(requestedResult);
    }

    /**
     * Set the single result type that you would like to be returned. Any previously set result types will be overwritten.
     * Result types can be the classes that extend RequestEvent base class (see classes below).
     */
    public setRequestedResult(requestEvent: RequestEvent) {
        if (!(requestEvent instanceof RequestEvent)) {
            throw Error("QueryEvent class can only accept result requests that are of type RequestEvent");
        }
        this.path = requestEvent.path;
        this.resultTypeList = [requestEvent];
    }

}

/**
 * @class QueryEventArticlesIter
 * Class for iterating through all the articles in the event via callbacks
 */
export class QueryEventArticlesIter extends QueryEvent {
    private readonly er: EventRegistry;
    private readonly sortBy;
    private readonly sortByAsc;
    private readonly returnInfo;
    private readonly eventUri;
    private readonly maxItems;
    private page = 0;
    private pages = 1;
    private items = [];
    private returnedSoFar = 0;
    private index = 0;
    private callback: (item) => void = _.noop;
    private doneCallback: (error?) => void = _.noop;
    private errorMessage;

    /**
     * @param er instance of EventRegistry class. used to obtain the necessary data
     * @param eventUri a single event for which we want to obtain the list of articles in it
     * @param args Object which contains a host of optional parameters
     */
    constructor(er: EventRegistry, eventUri: string, args: EventRegistryStatic.QueryEvent.IteratorArguments = {}) {
        super(eventUri);
        const {
            lang = undefined,
            sortBy = "cosSim",
            sortByAsc = false,
            returnInfo = new ReturnInfo({ articleInfo: new ArticleInfoFlags({ bodyLen: -1 }) }),
            maxItems = -1,
            keywords = undefined,
            conceptUri = undefined,
            categoryUri = undefined,
            sourceUri = undefined,
            sourceLocationUri = undefined,
            sourceGroupUri = undefined,
            authorUri = undefined,
            locationUri = undefined,
            dateStart = undefined,
            dateEnd = undefined,
            dateMentionStart = undefined,
            dateMentionEnd = undefined,
            keywordsLoc = "body",
            startSourceRankPercentile = 0,
            endSourceRankPercentile = 100,
        } = args;
        this.er = er;
        this.sortBy = sortBy;
        this.sortByAsc = sortByAsc;
        this.returnInfo = returnInfo;
        this.maxItems = maxItems;
        this.eventUri = eventUri;
        this.setQueryArrVal(keywords, "keyword", "keywordOper", "and");
        this.setQueryArrVal(conceptUri, "conceptUri", "conceptOper", "and");
        this.setQueryArrVal(categoryUri, "categoryUri", "categoryOper", "or");
        this.setQueryArrVal(sourceUri, "sourceUri", "sourceOper", "or");
        this.setQueryArrVal(sourceLocationUri, "sourceLocationUri", undefined, "or");
        this.setQueryArrVal(sourceGroupUri, "sourceGroupUri", "sourceGroupOper", "or");
        this.setQueryArrVal(authorUri, "authorUri", "authorOper", "or");
        this.setQueryArrVal(locationUri, "locationUri", undefined, "or");
        this.setQueryArrVal(lang, "lang", undefined, "or");

        if (!_.isUndefined(dateStart)) {
            this.setDateVal("dateStart", dateStart);
        }

        if (!_.isUndefined(dateEnd)) {
            this.setDateVal("dateEnd", dateEnd);
        }

        if (!_.isUndefined(dateMentionStart)) {
            this.setDateVal("dateMentionStart", dateMentionStart);
        }

        if (!_.isUndefined(dateMentionEnd)) {
            this.setDateVal("dateMentionEnd", dateMentionEnd);
        }

        this.setValIfNotDefault("keywordLoc", keywordsLoc, "body");

        if (startSourceRankPercentile < 0 || startSourceRankPercentile % 10 !== 0 || startSourceRankPercentile > 100) {
            throw new Error("StartSourceRankPercentile: Value should be in range 0-90 and divisible by 10.");
        }
        if (endSourceRankPercentile < 0 || endSourceRankPercentile % 10 !== 0 || endSourceRankPercentile > 100) {
            throw new Error("EndSourceRankPercentile: Value should be in range 0-90 and divisible by 10.");
        }
        if (startSourceRankPercentile > endSourceRankPercentile) {
            throw new Error("SourceRankPercentile: startSourceRankPercentile should be less than endSourceRankPercentile");
        }

        if (startSourceRankPercentile !== 0 ) {
            this.setVal("startSourceRankPercentile", startSourceRankPercentile);
        }

        if (endSourceRankPercentile !== 100 ) {
            this.setVal("endSourceRankPercentile", endSourceRankPercentile);
        }
    }

    public async count() {
        this.setRequestedResult(new RequestEventArticles(this.getQueryParams()));
        const response = await this.er.execQuery(this);
        if (_.has(response, "error")) {
            console.error(_.get(response, "error"));
        }
        return _.get(response[this.eventUri], "articles.totalResults", 0);
    }
    /**
     * Execute query and fetch batches of articles of the specified size (articleBatchSize)
     * @param callback callback function that'll be called every time we get a new batch of articles from the backend
     * @param doneCallback callback function that'll be called when everything is complete
     */
    public execQuery(callback: (item) => void, doneCallback?: (error) => void) {
        if (callback) { this.callback = callback; }
        if (doneCallback) { this.doneCallback = doneCallback; }
        this.iterate();
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
    private extractResults(response): Array<{[name: string]: any}> {
        const results = _.get(response[this.eventUri], "articles.results", []);
        const extractedSize = this.maxItems !== -1 ? this.maxItems - this.returnedSoFar : _.size(results);
        return _.compact(_.pullAt(results, _.range(0, extractedSize)) as Array<{}>);
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
            this.setRequestedResult(new RequestEventArticles({
                page: this.page,
                sortBy: this.sortBy,
                sortByAsc: this.sortByAsc,
                returnInfo: this.returnInfo,
                ...this.getQueryParams(),
            }));
            if (this.er.verboseOutput) {
                console.log(`Downloading page ${this.page}...`);
            }
            const response = await this.er.execQuery(this);
            const error = _.get(response[this.eventUri], "error", "");
            if (error) {
                this.errorMessage = `Error while obtaining a list of articles:  ${_.get(response[this.eventUri], "error")}`;
            } else {
                this.pages = _.get(response[this.eventUri], "articles.pages", 0);
            }
            const results = this.extractResults(response);
            this.returnedSoFar += _.size(results);
            this.items = [...this.items, ...results];
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}
export class RequestEvent extends QueryParamsBase {
    public path = "/api/v1/event/getEvent";
}

/**
 * @class RequestEventInfo
 * Return details about an event
 */
export class RequestEventInfo extends RequestEvent {
    public resultType = "info";
    public params;
    constructor(returnInfo = new ReturnInfo()) {
        super();
        this.params = returnInfo.getParams("info");
    }
}

/**
 * @class RequestEventArticles
 * Return articles about the event
 */
export class RequestEventArticles extends RequestEvent {
    public resultType = "articles";
    public params;

    constructor(args: EventRegistryStatic.QueryEvent.RequestEventArticlesArguments = {}) {
        super();
        const {
            page = 1,
            count = 100,
            lang = undefined,
            keywords = undefined,
            conceptUri = undefined,
            categoryUri = undefined,
            sourceUri = undefined,
            sourceLocationUri = undefined,
            sourceGroupUri = undefined,
            authorUri = undefined,
            locationUri = undefined,
            dateStart = undefined,
            dateEnd = undefined,
            dateMentionStart = undefined,
            dateMentionEnd = undefined,
            keywordsLoc = "body",
            startSourceRankPercentile = 0,
            endSourceRankPercentile = 100,
            sortBy = "cosSim",
            sortByAsc = false,
            returnInfo = new ReturnInfo({articleInfo: new ArticleInfoFlags({bodyLen: -1})}),
        } = args;

        if (page < 1) {
            throw new RangeError("Page has to be >= 1");
        }
        if (count > 100) {
            throw new RangeError("At most 100 articles can be returned per call");
        }
        this.params = {};
        this.params["articlesPage"] = page;
        this.params["articlesCount"] = count;
        this.params["articlesSortBy"] = sortBy;
        this.params["articlesSortByAsc"] = sortByAsc;
        this.setQueryArrVal(keywords, "keyword", "keywordOper", "and");
        this.setQueryArrVal(conceptUri, "conceptUri", "conceptOper", "and");
        this.setQueryArrVal(categoryUri, "categoryUri", "categoryOper", "or");
        this.setQueryArrVal(sourceUri, "sourceUri", "sourceOper", "or");
        this.setQueryArrVal(sourceLocationUri, "sourceLocationUri", undefined, "or");
        this.setQueryArrVal(sourceGroupUri, "sourceGroupUri", "sourceGroupOper", "or");
        this.setQueryArrVal(authorUri, "authorUri", "authorOper", "or");
        this.setQueryArrVal(locationUri, "locationUri", undefined, "or");
        this.setQueryArrVal(lang, "lang", undefined, "or");
        if (!_.isUndefined(dateStart)) {
            this.setDateVal("dateStart", dateStart);
        }
        if (!_.isUndefined(dateEnd)) {
            this.setDateVal("dateEnd", dateEnd);
        }
        if (!_.isUndefined(dateMentionStart)) {
            this.setDateVal("dateMentionStart", dateMentionStart);
        }
        if (!_.isUndefined(dateMentionEnd)) {
            this.setDateVal("dateMentionEnd", dateMentionEnd);
        }
        this.setValIfNotDefault("keywordLoc", keywordsLoc, "body");
        if (startSourceRankPercentile < 0 || startSourceRankPercentile % 10 !== 0 || startSourceRankPercentile > 100) {
            throw new Error("StartSourceRankPercentile: Value should be in range 0-90 and divisible by 10.");
        }
        if (endSourceRankPercentile < 0 || endSourceRankPercentile % 10 !== 0 || endSourceRankPercentile > 100) {
            throw new Error("EndSourceRankPercentile: Value should be in range 0-90 and divisible by 10.");
        }
        if (startSourceRankPercentile > endSourceRankPercentile) {
            throw new Error("SourceRankPercentile: startSourceRankPercentile should be less than endSourceRankPercentile");
        }

        if (startSourceRankPercentile !== 0 ) {
            this.setVal("startSourceRankPercentile", startSourceRankPercentile);
        }

        if (endSourceRankPercentile !== 100 ) {
            this.setVal("endSourceRankPercentile", endSourceRankPercentile);
        }
        this.params = _.extend({}, this.params, this.getQueryParams(), returnInfo.getParams("articles"));
    }
}

/**
 * @class RequestEventArticleUriWgts
 * Return just a list of article uris
 */
export class RequestEventArticleUriWgts extends RequestEvent {
    public resultType = "uriWgtList";
    public params;

    constructor(args: EventRegistryStatic.QueryEvent.RequestEventArticleUriWgtsArguments = {}) {
        super();
        const {
            lang = undefined,
            sortBy = "cosSim",
            sortByAsc = false,
            ...unsupported
        } = args;
        if (!_.isEmpty(unsupported)) {
            console.warn(`RequestEventArticleUriWgts: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        this.params = {};
        if (!_.isUndefined(lang)) {
            this.params["articlesLang"] = lang;
        }
        this.params["uriWgtListSortBy"] = sortBy;
        this.params["uriWgtListSortByAsc"] = sortByAsc;
    }
}

/**
 * @class RequestEventKeywordAggr
 * Return keyword aggregate (tag-cloud) from articles in the event.
 */
export class RequestEventKeywordAggr extends RequestEvent {
    public resultType = "keywordAggr";
    public params;
    /**
     * @param lang: language for which to compute the keywords
     */
    constructor(lang = "eng") {
        super();
        this.params = {};
        this.params["articlesLang"] = lang;
    }
}
/**
 * @class RequestEventSourceAggr
 * Get news source distribution of articles in the event.
 */
export class RequestEventSourceAggr extends RequestEvent {
    public resultType = "sourceExAggr";
}

/**
 * @class RequestEventDateMentionAggr
 * Get dates that we found mentioned in the event articles and their frequencies.
 */
export class RequestEventDateMentionAggr extends RequestEvent {
    public resultType = "dateMentionAggr";
}

/**
 * @class RequestEventArticleTrend
 * Return trending information for the articles about the event.
 */
export class RequestEventArticleTrend extends RequestEvent {
    public resultType = "articleTrend";
    public params;

    constructor(args: EventRegistryStatic.QueryEvent.RequestEventArticleTrendArguments = {}) {
        super();
        const {
            lang = undefined,
            page = 1,
            count = 100,
            minArticleCosSim = -1,
            returnInfo = new ReturnInfo({articleInfo: new ArticleInfoFlags({bodyLen: 0})}),
            ...unsupported
          } = args;
        if (!_.isEmpty(unsupported)) {
            console.warn(`RequestEventArticleTrend: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        if (page < 1) {
            throw new RangeError("Page has to be >= 1");
        }
        if (count > 100) {
            throw new RangeError("At most 100 articles can be returned per call");
        }
        this.params = {};
        this.params["articlesLang"] = lang;
        this.params["articleTrendPage"] = page;
        this.params["articleTrendCount"] = count;
        this.params["articleTrendMinArticleCosSim"] = minArticleCosSim;
        this.params = _.extend({}, this.params, returnInfo.getParams("articleTrend"));
    }
}

/**
 * @class RequestEventSimilarEvents
 * Compute and return a list of similar events.
 */
export class RequestEventSimilarEvents extends RequestEvent {
    public path = "/api/v1/event/getSimilarEvents";
    public params;
    constructor(args: EventRegistryStatic.QueryEvent.RequestEventSimilarEventsArguments = {}) {
        super();
        const {
            conceptInfoList,
            count = 50,
            maxDayDiff = Number.MAX_SAFE_INTEGER, // in place of Python's `sys.maxsize`
            addArticleTrendInfo = false,
            aggrHours = 6,
            includeSelf = false,
            returnInfo = new ReturnInfo(),
            ...unsupported
          } = args;
        if (!_.isEmpty(unsupported)) {
            console.warn(`RequestEventSimilarEvents: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        if (count > 50) {
            throw new RangeError("At most 50 similar events can be returned per call");
        }
        if (!_.isArray(conceptInfoList)) {
            throw new Error("Concept info list is not an array");
        }
        this.params = {};
        this.params["concepts"] = JSON.stringify(conceptInfoList);
        this.params["count"] = count;
        if (maxDayDiff !== Number.MAX_SAFE_INTEGER) {
            this.params["maxDayDiff"] = maxDayDiff;
        }
        this.params["addArticleTrendInfo"] = addArticleTrendInfo;
        this.params["aggrHours"] = aggrHours;
        this.params["includeSelf"] = includeSelf;
        this.params = _.extend({}, this.params, returnInfo.getParams());
    }
}

/**
 * @class RequestEventSimilarStories
 * Return a list of similar stories (clusters).
 */
export class RequestEventSimilarStories extends RequestEvent {
    public resultType = "similarStories";
    public params;
    constructor(args: EventRegistryStatic.QueryEvent.RequestEventSimilarStoriesArguments = {}) {
        super();
        const {
            conceptInfoList,
            count = 50,
            lang = ["eng"],
            maxDayDiff = Number.MAX_SAFE_INTEGER, // in place of Python's `sys.maxsize`
            returnInfo = new ReturnInfo(),
            ...unsupported
          } = args;
        if (!_.isEmpty(unsupported)) {
            console.warn(`RequestEventSimilarStories: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        if (count > 50) {
            throw new RangeError("At most 50 similar stories can be returned per call");
        }
        if (!_.isArray(conceptInfoList)) {
            throw new Error("Concept info list is not an array");
        }
        this.params = {};
        this.params["similarStoriesConcepts"] = JSON.stringify(conceptInfoList);
        this.params["similarStoriesCount"] = count;
        this.params["similarStoriesLang"] = lang;
        if (maxDayDiff !== Number.MAX_SAFE_INTEGER) {
            this.params["similarStoriesMaxDayDiff"] = maxDayDiff;
        }
        this.params = _.extend({}, this.params, returnInfo.getParams("similarStories"));
    }
}
