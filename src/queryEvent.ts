import * as _ from "lodash";
import { mainLangs, Query } from "./base";
import { EventRegistry } from "./eventRegistry";
import { QueryArticle, RequestArticleInfo } from "./queryArticle";
import { QueryArticles, RequestArticlesInfo } from "./queryArticles";
import { ArticleInfoFlags, ReturnInfo } from "./returnInfo";
import { ER } from "./types";
/**
 * @class QueryEvent
 * Class for obtaining available info for one or more events in the Event Registry
 */
export class QueryEvent extends Query<RequestEvent> {
    /**
     * @param eventUriOrList A single event uri or a list of event uris
     * @param requestedResult The information to return as the result of the query. By default return the details of the event
     */
    constructor(eventUriOrList: string | string[], requestedResult = new RequestEventInfo()) {
        super();
        this.setVal("action", "getEvent");
        this.setVal("eventUri", eventUriOrList);
        this.setRequestedResult(requestedResult);
    }

    public get path() {
        return "/json/event";
    }

    /**
     * Set the single result type that you would like to be returned. Any previously set result types will be overwritten.
     * Result types can be the classes that extend RequestEvent base class (see classes below).
     */
    public setRequestedResult(requestEvent: RequestEvent) {
        if (!(requestEvent instanceof RequestEvent)) {
            throw Error("QueryEvent class can only accept result requests that are of type RequestEvent");
        }
        this.resultTypeList = [requestEvent];
    }

}

/**
 * @class QueryEventArticlesIter
 * Class for iterating through all the articles in the event via callbacks
 */
export class QueryEventArticlesIter extends QueryEvent {
    private readonly er: EventRegistry;
    private readonly lang;
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
    constructor(er: EventRegistry, eventUri: string, args: ER.QueryEvent.IteratorArguments = {}) {
        super(eventUri);
        const {
            lang = mainLangs,
            sortBy = "cosSim",
            sortByAsc = false,
            returnInfo = new ReturnInfo({ articleInfo: new ArticleInfoFlags({ bodyLen: -1 }) }),
            maxItems = -1,
        } = args;
        this.er = er;
        this.lang = lang;
        this.sortBy = sortBy;
        this.sortByAsc = sortByAsc;
        this.returnInfo = returnInfo;
        this.maxItems = maxItems;
        this.eventUri = eventUri;
    }

    public async count(lang = mainLangs) {
        this.setRequestedResult(new RequestEventArticles({lang}));
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
            const requestEventArticles = new RequestEventArticles({
                page: this.page,
                count: 100,
                lang: this.lang,
                sortBy: this.sortBy,
                sortByAsc: this.sortByAsc,
                returnInfo: this.returnInfo,
            });
            this.setRequestedResult(requestEventArticles);
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

export class RequestEvent {}

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
            lang = mainLangs,
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
        this.params["articlesLang"] = lang;
        this.params["articlesSortBy"] = sortBy;
        this.params["articlesSortByAsc"] = sortByAsc;
        this.params = _.extend({}, this.params, returnInfo.getParams("articles"));
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
            lang = mainLangs,
            sortBy = "cosSim",
            sortByAsc = false,
        } = args;
        this.params = {};
        this.params["uriWgtListLang"] = lang;
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
        this.params["keywordAggrLang"] = lang;
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
            lang = mainLangs,
            page = 1,
            count = 100,
            minArticleCosSim = -1,
            returnInfo = new ReturnInfo({articleInfo: new ArticleInfoFlags({bodyLen: 0})}),
          } = args;
        if (page < 1) {
            throw new RangeError("Page has to be >= 1");
        }
        if (count > 100) {
            throw new RangeError("At most 100 articles can be returned per call");
        }
        this.params = {};
        this.params["articleTrendLang"] = lang;
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
    public resultType = "similarEvents";
    public params;
    constructor(args: ER.QueryEvent.RequestEventSimilarEventsArguments = {}) {
        super();
        const {
            conceptInfoList,
            count = 50,
            maxDayDiff = Number.MAX_SAFE_INTEGER, // in place of Python's `sys.maxsize`
            addArticleTrendInfo = false,
            aggrHours = 6,
            includeSelf = false,
            returnInfo = new ReturnInfo(),
          } = args;
        if (count > 50) {
            throw new RangeError("At most 50 similar events can be returned per call");
        }
        if (!_.isArray(conceptInfoList)) {
            throw new Error("Concept info list is not an array");
        }
        this.params = {};
        this.params["similarEventsConcepts"] = JSON.stringify(conceptInfoList);
        this.params["similarEventsCount"] = count;
        if (maxDayDiff !== Number.MAX_SAFE_INTEGER) {
            this.params["similarEventsMaxDayDiff"] = maxDayDiff;
        }
        this.params["similarEventsAddArticleTrendInfo"] = addArticleTrendInfo;
        this.params["similarEventsAggrHours"] = aggrHours;
        this.params["similarEventsIncludeSelf"] = includeSelf;
        this.params = _.extend({}, this.params, returnInfo.getParams("similarEvents"));
    }
}

/**
 * @class RequestEventSimilarStories
 * Return a list of similar stories (clusters).
 */
export class RequestEventSimilarStories extends RequestEvent {
    public resultType = "similarStories";
    public params;
    constructor(args: ER.QueryEvent.RequestEventSimilarStoriesArguments = {}) {
        super();
        const {
            conceptInfoList,
            count = 50,
            lang = ["eng"],
            maxDayDiff = Number.MAX_SAFE_INTEGER, // in place of Python's `sys.maxsize`
            returnInfo = new ReturnInfo(),
          } = args;
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
