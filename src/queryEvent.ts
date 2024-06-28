import { Query, QueryParamsBase } from "./base";
import { Data } from "./data";
import { EventRegistry } from "./eventRegistry";
import { ArticleInfoFlags, ReturnInfo } from "./returnInfo";
import { ER } from "./types";
import { Logger } from "./logger";
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
export class QueryEventArticlesIter extends QueryEvent implements AsyncIterable<Data.Article> {
    private readonly er: EventRegistry;
    private readonly sortBy: ER.QueryEvent.SortByOptions;
    private readonly sortByAsc: boolean;
    private readonly returnInfo: ReturnInfo;
    private readonly eventUri: string;
    private readonly maxItems: number;
    private page: number = 0;
    private pages: number = 1;
    private items: Data.Article[] = [];
    private returnedSoFar: number = 0;
    private index: number = 0;
    private callback: (item: Data.Article) => void = () => undefined;
    private doneCallback: (error?: string) => void = () => undefined;
    private errorMessage: string;

    /**
     * @param er instance of EventRegistry class. used to obtain the necessary data
     * @param eventUri a single event for which we want to obtain the list of articles in it
     * @param args Object which contains a host of optional parameters
     */
    constructor(er: EventRegistry, eventUri: string, args: ER.QueryEvent.IteratorArguments = {}) {
        super(eventUri);
        const {
            lang = undefined,
            sortBy = "cosSim",
            sortByAsc = false,
            returnInfo = undefined,
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
            keywordSearchMode = "phrase", // "simple", "exact", "phrase"]
            startSourceRankPercentile = 0,
            endSourceRankPercentile = 100,
            minSentiment = -1,
            maxSentiment = 1,
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

        if (dateStart !== undefined) {
            this.setDateVal("dateStart", dateStart);
        }

        if (dateEnd !== undefined) {
            this.setDateVal("dateEnd", dateEnd);
        }

        if (dateMentionStart !== undefined) {
            this.setDateVal("dateMentionStart", dateMentionStart);
        }

        if (dateMentionEnd !== undefined) {
            this.setDateVal("dateMentionEnd", dateMentionEnd);
        }

        this.setValIfNotDefault("keywordLoc", keywordsLoc, "body");
        this.setValIfNotDefault("keywordSearchMode", keywordSearchMode, "phrase");

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

        if (minSentiment > -1 && minSentiment <= 1 ) {
            this.setVal("minSentiment", minSentiment);
        }

        if (maxSentiment >= -1 && maxSentiment < 1 ) {
            this.setVal("maxSentiment", maxSentiment);
        }
    }

    /**
     * Async Iterator function that returns the next item in the list of articles
     */
    [Symbol.asyncIterator](): AsyncIterator<Data.Article> {
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
        this.setRequestedResult(new RequestEventArticles(this.getQueryParams()));
        const response = await this.er.execQuery(this);
        if (!!response?.error) {
            this.er.logger.error(response?.error ?? "Error while obtaining a list of articles");
        }
        return (response[this.eventUri] as Record<string, ER.Results<unknown>>)?.articles?.totalResults ?? 0;
    }
    /**
     * Execute query and fetch batches of articles of the specified size (articleBatchSize)
     * @param callback callback function that'll be called every time we get a new batch of articles from the backend
     * @param doneCallback callback function that'll be called when everything is complete
     */
    public execQuery(callback: (item: Data.Article) => void, doneCallback?: (error?: string) => void): void {
        if (callback) { this.callback = callback; }
        if (doneCallback) { this.doneCallback = doneCallback; }
        this.iterate();
    }

    private async iterate(): Promise<void> {
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
    private extractResults(response): Data.Article[] {
        const results = response[this.eventUri]?.articles?.results || [];
        const extractedSize = this.maxItems !== -1 ? this.maxItems - this.returnedSoFar : results.length;
        const extractedResults = results.slice(0, extractedSize);
        return extractedResults.filter(Boolean);
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
                this.er.logger.info(`Downloading page ${this.page}...`);
            }
            const response = await this.er.execQuery(this, this.er.allowUseOfArchive);
            const error = (response[this.eventUri] as ER.ErrorResponse)?.error || "";
            if (error) {
                this.errorMessage = `Error while obtaining a list of articles:  ${(response[this.eventUri] as ER.ErrorResponse)?.error}`;
            } else {
                this.pages = (response[this.eventUri] as Record<string, ER.Results>)?.articles?.pages || 0;
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

    constructor(args: ER.QueryEvent.RequestEventArticlesArguments = {}) {
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
            returnInfo = undefined,
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
        this.setQueryArrVal(lang, "articlesLang", undefined, "or");
        if (dateStart !== undefined) {
            this.setDateVal("dateStart", dateStart);
        }
        if (dateEnd !== undefined) {
            this.setDateVal("dateEnd", dateEnd);
        }
        if (dateMentionStart !== undefined) {
            this.setDateVal("dateMentionStart", dateMentionStart);
        }
        if (dateMentionEnd !== undefined) {
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

        if (returnInfo) {
            this.params = {
                ...this.params,
                ...this.getQueryParams(),
                ...returnInfo.getParams("articles")
            };
        }
    }
}

/**
 * @class RequestEventArticleUriWgts
 * Return just a list of article uris
 */
export class RequestEventArticleUriWgts extends RequestEvent {
    public resultType = "uriWgtList";
    public params;

    constructor(args: ER.QueryEvent.RequestEventArticleUriWgtsArguments = {}) {
        super();
        const {
            lang = undefined,
            sortBy = "cosSim",
            sortByAsc = false,
            ...unsupported
        } = args;
        if (Object.keys(unsupported).length > 0) {
            Logger.warn(`RequestEventArticleUriWgts: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        this.params = {};
        if (lang !== undefined) {
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

    constructor(args: ER.QueryEvent.RequestEventArticleTrendArguments = {}) {
        super();
        const {
            lang = undefined,
            page = 1,
            count = 100,
            minArticleCosSim = -1,
            returnInfo = new ReturnInfo({articleInfo: new ArticleInfoFlags({bodyLen: 0})}),
            ...unsupported
        } = args;
        if (Object.keys(unsupported).length > 0) {
            Logger.warn(`RequestEventArticleTrend: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
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
        this.params = {
            ...this.params,
            ...returnInfo.getParams("articleTrend")
        };
    }
}

/**
 * @class RequestEventSimilarEvents
 * Compute and return a list of similar events.
 */
export class RequestEventSimilarEvents extends RequestEvent {
    public path = "/api/v1/event/getSimilarEvents";
    public params;
    constructor(args: ER.QueryEvent.RequestEventSimilarEventsArguments = {}) {
        super();
        const {
            conceptInfoList,
            count = 50,
            dateStart = undefined,
            dateEnd = undefined,
            addArticleTrendInfo = false,
            aggrHours = 6,
            returnInfo = new ReturnInfo(),
            ...unsupported
        } = args;
        if (Object.keys(unsupported).length > 0) {
            Logger.warn(`RequestEventSimilarEvents: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        if (count > 50) {
            throw new RangeError("At most 50 similar events can be returned per call");
        }
        if (!Array.isArray(conceptInfoList)) {
            throw new Error("Concept info list is not an array");
        }
        this.params = {};
        this.params["action"] = "getSimilarEvents";

        this.params["concepts"] = JSON.stringify(conceptInfoList);
        // Potential problem, verify that output corresponds the REST API docs.
        this.params["eventsCount"] = count;
        if (dateStart) {
            this.params["dateStart"] = QueryParamsBase.encodeDateTime(dateStart, "YYYY-MM-DD");
        }
        if (dateEnd) {
            this.params["dateEnd"] = QueryParamsBase.encodeDateTime(dateEnd, "YYYY-MM-DD");
        }
        this.params["addArticleTrendInfo"] = addArticleTrendInfo;
        this.params["aggrHours"] = aggrHours;
        this.params["resultType"] = "similarEvents";
        this.params = {
            ...this.params,
            ...returnInfo.getParams()
        };
    }
}
