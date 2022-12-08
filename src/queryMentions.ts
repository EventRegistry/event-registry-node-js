import * as _ from "lodash";
import { Query, QueryParamsBase } from "./base";
import { EventRegistry } from "./eventRegistry";
import { ReturnInfo } from "./returnInfo";
import { EventRegistryStatic } from "./types";

export class QueryMentions extends Query<RequestMentions> {
    public params = {};
    constructor(args: EventRegistryStatic.QueryMentions.Arguments = {}) {
        super();
        const {
            eventTypeUri,
            keywords,
            conceptUri,
            categoryUri,
            sourceUri,
            sourceLocationUri,
            sourceGroupUri,
            industryUri,
            locationUri,
            lang,
            dateStart,
            dateEnd,
            ignoreEventTypeUri,
            ignoreKeywords,
            ignoreConceptUri,
            ignoreCategoryUri,
            ignoreSourceUri,
            ignoreSourceLocationUri,
            ignoreSourceGroupUri,
            ignoreIndustryUri,
            ignoreLocationUri,
            ignoreLang,
            showDuplicates,
            startSourceRankPercentile = 0,
            endSourceRankPercentile = 100,
            minSentiment = -1,
            maxSentiment = 1,
            requestedResult = new RequestMentions(),
        } = args;

        this.setVal("action", "getMentions");
        this.setQueryArrVal(eventTypeUri, "eventTypeUri", undefined, "or");
        this.setQueryArrVal(keywords, "keyword", "keywordOper", "and");
        this.setQueryArrVal(conceptUri, "conceptUri", "conceptOper", "and");
        this.setQueryArrVal(categoryUri, "categoryUri", "categoryOper", "or");
        this.setQueryArrVal(sourceUri, "sourceUri", undefined, "or");
        this.setQueryArrVal(sourceLocationUri, "sourceLocationUri", undefined, "or");
        this.setQueryArrVal(sourceGroupUri, "sourceGroupUri", undefined, "or");
        this.setQueryArrVal(industryUri, "industryUri", "industryOper", "or");
        this.setQueryArrVal(locationUri, "locationUri", undefined, "or");
        this.setQueryArrVal(lang, "lang", undefined, "or");
        if (!_.isUndefined(dateStart)) {
            this.setDateVal("dateStart", dateStart);
        }
        if (!_.isUndefined(dateEnd)) {
            this.setDateVal("dateEnd", dateEnd);
        }

        this.setQueryArrVal(ignoreEventTypeUri, "ignoreEventTypeUri", undefined, "or");
        this.setQueryArrVal(ignoreKeywords, "ignoreKeywords", undefined, "or");
        this.setQueryArrVal(ignoreConceptUri, "ignoreConceptUri", undefined, "or");
        this.setQueryArrVal(ignoreCategoryUri, "ignoreCategoryUri", undefined, "or");
        this.setQueryArrVal(ignoreSourceUri, "ignoreSourceUri", undefined, "or");
        this.setQueryArrVal(ignoreSourceLocationUri, "ignoreSourceLocationUri", undefined, "or");
        this.setQueryArrVal(ignoreSourceGroupUri, "ignoreSourceGroupUri", undefined, "or");
        this.setQueryArrVal(ignoreIndustryUri, "ignoreIndustryUri", undefined, "or");
        this.setQueryArrVal(ignoreLocationUri, "ignoreLocationUri", undefined, "or");

        this.setQueryArrVal(ignoreLang, "ignoreLang", undefined, "or");
        this.setValIfNotDefault("showDuplicates", showDuplicates, false);
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
        this.setRequestedResult(requestedResult);
    }

    public get path() {
        return "/api/v1/eventType/mention";
    }

    /**
     * Set the single result type that you would like to be returned. Any previously set result types will be overwritten.
     * Result types can be the classes that extend RequestMentions base class (see classes below).
     */
    public setRequestedResult(requestMentions: RequestMentions) {
        if (!(requestMentions instanceof RequestMentions)) {
            throw new Error("QueryMentions class can only accept result requests that are of type RequestMentions");
        }
        this.resultTypeList = [
            requestMentions,
        ];
    }

    public static initWithMentionUriList(...args);
    public static initWithMentionUriList(uriList) {
        const q = new QueryMentions();
        if (!_.isArray(uriList)) {
            throw new Error("uriList has to be a list of strings that represent mention uris");
        }
        q.params = {
            action: "getMentions",
            mentionUri: uriList,
        };
    }

    public static initWithMentionUriWgtList(...args);
    public static initWithMentionUriWgtList(uriWgtList) {
        const q = new QueryMentions();
        if (!_.isArray(uriWgtList)) {
            throw new Error("uriList has to be a list of strings that represent mention uris");
        }
        q.params = {
            action: "getMentions",
            mentionUriWgtList: _.join(uriWgtList, ","),
        };
        return q;
    }

    public static initWithComplexQuery(...args);
    public static initWithComplexQuery(complexQuery) {
        const query = new QueryMentions();
        if (_.isString(complexQuery)) {
            query.setVal("query", complexQuery);
        } else if (_.isObject(complexQuery)) {
            query.setVal("query", JSON.stringify(complexQuery));
        } else {
            throw new Error("The instance of query parameter was not a string or an object");
        }
        return query;
    }
}

export class QueryMentionsIter extends QueryMentions {
    private readonly er: EventRegistry;
    private readonly sortBy;
    private readonly sortByAsc;
    private readonly returnInfo;
    private readonly maxItems;
    private page = 0;
    private pages = 1;
    private items = [];
    private returnedSoFar = 0;
    private index = 0;
    private callback: (item) => void = _.noop;
    private doneCallback: (error?) => void = _.noop;
    private errorMessage;

    constructor(er: EventRegistry, args: EventRegistryStatic.QueryEvents.IteratorArguments = {}) {
        super(args as EventRegistryStatic.QueryMentions.Arguments);
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

    public async count(): Promise<number> {
        this.setRequestedResult(new RequestMentionsInfo());
        const response = await this.er.execQuery(this);
        if (_.has(response, "error")) {
            console.error(_.get(response, "error"));
        }
        return _.get(response, "mentions.totalResults", 0);
    }

    /**
     * Execute query and fetch batches of articles of the specified size (eventBatchSize)
     * @param callback callback function that'll be called every time we get a new batch of events from the backend
     * @param doneCallback callback function that'll be called when everything is complete
     */
     public execQuery(callback: (item) => void, doneCallback?: (error?) => void) {
        if (callback) { this.callback = callback; }
        if (doneCallback) { this.doneCallback = doneCallback; }
        this.iterate();
    }

    public static initWithComplexQuery(er, complexQuery, args: EventRegistryStatic.QueryMentions.IteratorArguments = {}) {
        const query = new QueryMentionsIter(er, args);
        if (_.isString(complexQuery)) {
            query.setVal("query", complexQuery);
        } else if (_.isObject(complexQuery)) {
            query.setVal("query", JSON.stringify(complexQuery));
        } else {
            throw new Error("The instance of query parameter was not a string or an object");
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
    private extractResults(response): Array<{[name: string]: any}> {
        const results = _.get(response, "mentions.results", []);
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
            const requestEventsInfo = new RequestMentionsInfo({
                page: this.page,
                count: 50,
                sortBy: this.sortBy,
                sortByAsc: this.sortByAsc,
                returnInfo: this.returnInfo,
            });
            this.setRequestedResult(requestEventsInfo);
            if (this.er.verboseOutput) {
                console.log(`Downloading event page ${this.page}...`);
            }
            const response = await this.er.execQuery(this, this.er.allowUseOfArchive);
            const error = _.get(response, "error", "");
            if (error) {
                this.errorMessage = `Error while obtaining a list of events:  ${_.get(response, "error")}`;
            } else {
                this.pages = _.get(response, "events.pages", 0);
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

export class RequestMentions {}

export class RequestMentionsInfo extends RequestMentions {
    public resultType = "mentions";
    public params;
    constructor(args: EventRegistryStatic.QueryEvents.RequestEventsInfoArguments = {}) {
        super();
        const {
            page = 1,
            count = 100,
            sortBy = "date",
            sortByAsc = false,
            returnInfo = undefined,
        } = args;
        if (page < 1) {
            throw new RangeError("Page has to be >= 1");
        }
        if (count > 100) {
            throw new RangeError("At most 100 mentions can be returned per call");
        }
        this.params = {};
        this.params["mentionsPage"] = page;
        this.params["mentionsCount"] = count;
        this.params["mentionsSortBy"] = sortBy;
        this.params["mentionsSortByAsc"] = sortByAsc;
        if (!!returnInfo) {
            this.params = _.extend({}, this.params, returnInfo.getParams("mentions"));
        }
    }

    public set page(page) {
        if (page < 1) {
            throw new RangeError("Page has to be >= 1");
        }
        _.set(this.params, "mentionsPage", page);
    }
}

export class RequestMentionsUriWgtList extends RequestMentions {
    public resultType = "uriWgtList";
    public params;

    constructor(args: EventRegistryStatic.QueryMentions.RequestMentionsUriWgtListArguments = {}) {
        super();
        const {
            page = 1,
            count = 10000,
            sortBy = "fq",
            sortByAsc = false,
            ...unsupported
        } = args;
        if (!_.isEmpty(unsupported)) {
            console.warn(`RequestMentionsUriWgtList: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        if (page < 1) {
            throw new RangeError("Page has to be >= 1");
        }
        if (count > 50000) {
            throw new RangeError("At most 50000 results can be returned per call");
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

export class RequestMentionsTimeAggr extends RequestMentions {
    public resultType = "timeAggr";
}

export class RequestMentionsConceptAggr extends RequestMentions {
    public resultType = "conceptAggr";
    public params;
    constructor(args: EventRegistryStatic.QueryMentions.RequestMentionsConceptAggrArguments = {}) {
        super();
        const {
            conceptCount = 25,
            mentionsSampleSize = 100000,
            conceptScoring = "importance",
            conceptCountPerType = undefined,
            returnInfo = new ReturnInfo(),
        } = args;
        if (conceptCount > 500) {
            throw new RangeError("At most 500 top concepts can be returned");
        }
        if (mentionsSampleSize > 20000) {
            throw new RangeError("At most 20000 results can be used for computing");
        }
        this.params = {};
        this.params["conceptAggrConceptCount"] = conceptCount;
        this.params["conceptAggrSampleSize"] = mentionsSampleSize;
        this.params["conceptAggrScoring"] = conceptScoring;
        if (!!conceptCountPerType) {
            this.params["conceptAggrConceptCountPerType"] = conceptCountPerType;
        }
        this.params = _.extend({}, this.params, returnInfo.getParams("conceptAggr"));
    }
}

export class RequestMentionsCategoryAggr extends RequestMentions {
    public resultType = "categoryAggr";
    public params;
    constructor(args: EventRegistryStatic.QueryMentions.RequestMentionsCategoryAggrArguments = {}) {
        super();
        const {
            mentionsSampleSize = 20000,
            returnInfo = new ReturnInfo(),
        } = args;
        if (mentionsSampleSize > 50000) {
            throw new RangeError("At most 50000 results can be used for aggregation");
        }
        this.params["categoryAggrSampleSize"] = mentionsSampleSize;
        this.params = returnInfo.getParams("categoryAggr");
    }
}

export class RequestMentionsSourceAggr extends RequestMentions {
    public resultType = "sourceAggr";
    public params;
    constructor(args: EventRegistryStatic.QueryMentions.RequestMentionsSourceAggrArguments = {}) {
        super();
        const {
            sourceCount = 50,
            normalizeBySourceArts = false,
            returnInfo = new ReturnInfo(),
        } = args;
        this.params["sourceAggrSourceCount"] = sourceCount;
        this.params = returnInfo.getParams("sourceAggr");
    }
}

export class RequestMentionsKeywordAggr extends RequestMentions {
    public resultType = "keywordAggr";
    public params;
    constructor(args: EventRegistryStatic.QueryMentions.RequestMentionsKeywordAggrArguments = {}) {
        super();
        const {
            mentionsSampleSize = 2000,
        } = args;
        if (mentionsSampleSize > 20000) {
            throw new RangeError("At most 20000 results can be used for aggregation");
        }
        this.params["keywordAggrSampleSize"] = mentionsSampleSize;
    }
}

export class RequestMentionsConceptGraph extends RequestMentions {
    public resultType = "conceptGraph";
    public params;

    constructor(args: EventRegistryStatic.QueryMentions.RequestMentionsConceptGraphArguments = {}) {
        super();
        const {
            conceptCount = 25,
            linkCount = 50,
            mentionsSampleSize = 10000,
            skipQueryConcepts = true,
            returnInfo = new ReturnInfo(),
        } = args;
        if (conceptCount > 1000) {
            throw new RangeError("At most 1000 top concepts can be returned");
        }
        if (linkCount > 2000) {
            throw new RangeError("At most 2000 links between concepts can be returned");
        }
        if (mentionsSampleSize > 50000) {
            throw new RangeError("At most 50000 results can be used for computing");
        }
        this.params = {};
        this.params["conceptGraphConceptCount"] = conceptCount;
        this.params["conceptGraphLinkCount"] = linkCount;
        this.params["conceptGraphSampleSize"] = mentionsSampleSize;
        this.params["conceptGraphSkipQueryConcepts"] = skipQueryConcepts;
        this.params = _.extend({}, this.params, returnInfo.getParams("conceptGraph"));
    }
}

export class RequestMentionsRecentActivity extends RequestMentions {
    public resultType = "recentActivityMentions";
    public params;
    constructor(args: EventRegistryStatic.QueryMentions.RequestMentionsRecentActivityArguments = {}) {
        super();
        const {
            maxMentionCount = 100,
            updatesAfterUri = undefined,
            updatesAfterTm = undefined,
            updatesAfterMinsAgo = undefined,
            updatesUntilTm = undefined,
            updatesUntilMinsAgo = undefined,
            mandatorySourceLocation = false,
            returnInfo = undefined,
        } = args;
        if (maxMentionCount > 2000) {
            throw new RangeError("At most 2000 mentions can be returned");
        }
        if (!_.isUndefined(updatesAfterTm) && !_.isUndefined(updatesAfterMinsAgo)) {
            throw new Error("You should specify either updatesAfterTm or updatesAfterMinsAgo parameter, but not both");
        }
        if (!_.isUndefined(updatesUntilTm) && !_.isUndefined(updatesUntilMinsAgo)) {
            throw new Error("You should specify either updatesUntilTm or updatesUntilMinsAgo parameter, but not both");
        }
        this.params = {};
        this.params["recentActivityMentionsMaxMentionCount"] = maxMentionCount;

        if (!_.isUndefined(updatesAfterTm)) {
            this.params["recentActivityMentionsUpdatesAfterTm"] = QueryParamsBase.encodeDateTime(updatesAfterTm);
        }

        if (!_.isUndefined(updatesAfterMinsAgo)) {
            this.params["recentActivityMentionsUpdatesAfterMinsAgo"] = updatesAfterMinsAgo;
        }

        if (!_.isUndefined(updatesUntilTm)) {
            this.params["recentActivityMentionsUpdatesUntilTm"] = QueryParamsBase.encodeDateTime(updatesUntilTm);
        }

        if (!_.isUndefined(updatesUntilMinsAgo)) {
            this.params["recentActivityMentionsUpdatesUntilMinsAgo"] = updatesUntilMinsAgo;
        }

        if (!_.isUndefined(updatesAfterUri)) {
            this.params["recentActivityMentionsUpdatesAfterUri"] = updatesAfterUri;
        }

        this.params["recentActivityMentionsMandatorySourceLocation"] = mandatorySourceLocation;

        if (!_.isUndefined(returnInfo)) {
            this.params = _.extend({}, this.params, returnInfo.getParams("recentActivityMentions"));
        }
    }
}

