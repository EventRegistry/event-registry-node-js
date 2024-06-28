import { Query, QueryParamsBase } from "./base";
import { EventRegistry } from "./eventRegistry";
import { ReturnInfo } from "./returnInfo";
import { ER } from "./types";
import { Logger } from "./logger";

export class QueryMentions extends Query<RequestMentions> {
    public params = {};
    constructor(args: ER.QueryMentions.Arguments = {}) {
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
            sdgUri,
            sasbUri,
            esgUri,
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
            ignoreSdgUri,
            ignoreSasbUri,
            ignoreEsgUri,
            ignoreLocationUri,
            ignoreLang,
            showDuplicates,
            startSourceRankPercentile = 0,
            endSourceRankPercentile = 100,
            minSentiment = -1,
            maxSentiment = 1,
            minSentenceIndex,
            maxSentenceIndex,
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
        this.setQueryArrVal(sdgUri, "sdgUri", undefined, "or");
        this.setQueryArrVal(sasbUri, "sasbUri", undefined, "or");
        this.setQueryArrVal(esgUri, "esgUri", undefined, "or");
        this.setQueryArrVal(locationUri, "locationUri", undefined, "or");
        this.setQueryArrVal(lang, "lang", undefined, "or");
        if (dateStart !== undefined) {
            this.setDateVal("dateStart", dateStart);
        }
        if (dateEnd !== undefined) {
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
        this.setQueryArrVal(ignoreSdgUri, "ignoreSdgUri", undefined, "or");
        this.setQueryArrVal(ignoreSasbUri, "ignoreSasbUri", undefined, "or");
        this.setQueryArrVal(ignoreEsgUri, "ignoreEsgUri", undefined, "or");
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
        if (!!minSentenceIndex && minSentenceIndex > 0 ) {
            this.setVal("minSentenceIndex", minSentenceIndex);
        }
        if (!!maxSentenceIndex && maxSentenceIndex > 0 ) {
            this.setVal("maxSentenceIndex", maxSentenceIndex);
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
        if (!Array.isArray(uriList)) {
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
        if (!Array.isArray(uriWgtList)) {
            throw new Error("uriList has to be a list of strings that represent mention uris");
        }
        q.params = {
            action: "getMentions",
            mentionUriWgtList: uriWgtList.join(","),
        };
        return q;
    }

    public static initWithComplexQuery(...args);
    public static initWithComplexQuery(complexQuery) {
        const query = new QueryMentions();
        if (typeof complexQuery === "string") {
            query.setVal("query", complexQuery);
        } else if (typeof complexQuery === "object" && complexQuery !== null) {
            query.setVal("query", JSON.stringify(complexQuery));
        } else {
            throw new Error("The instance of query parameter was not a string or an object");
        }
        return query;
    }
}

export class QueryMentionsIter extends QueryMentions implements AsyncIterable<Record<string, any>> {
    private readonly er: EventRegistry;
    private readonly sortBy: "date" | "socialScore" | "none" | "rel" | "size";
    private readonly sortByAsc: boolean;
    private readonly returnInfo: ReturnInfo;
    private readonly maxItems: number;
    private page: number = 0;
    private pages: number = 1;
    private items: Record<string, any>[] = [];
    private returnedSoFar: number = 0;
    private index: number = 0;
    private callback: (item: Record<string, any>) => void = () => {};
    private doneCallback: (error?: string) => void = () => {};
    private errorMessage: string;

    constructor(er: EventRegistry, args: ER.QueryMentions.IteratorArguments = {}) {
        super(args as ER.QueryMentions.Arguments);
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

    [Symbol.asyncIterator](): AsyncIterator<Record<string, any>> {
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
        this.setRequestedResult(new RequestMentionsInfo());
        const response = await this.er.execQuery(this);
        if (response?.error) {
            this.er.logger.error(response.error);
        }
        return (response.mentions as ER.Results)?.totalResults || 0;
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

    public static initWithComplexQuery(er, complexQuery, args: ER.QueryMentions.IteratorArguments = {}) {
        const query = new QueryMentionsIter(er, args);
        if (typeof complexQuery === "string") {
            query.setVal("query", complexQuery);
        } else if (typeof complexQuery === "object" && complexQuery !== null) {
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
        const results = response.mentions?.results || [];
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
            const requestMentionsInfo = new RequestMentionsInfo({
                page: this.page,
                count: 50,
                sortBy: this.sortBy,
                sortByAsc: this.sortByAsc,
                returnInfo: this.returnInfo,
            });
            this.setRequestedResult(requestMentionsInfo);
            if (this.er.verboseOutput) {
                this.er.logger.info(`Downloading mentions page ${this.page}...`);
            }
            const response = await this.er.execQuery(this, this.er.allowUseOfArchive);
            const error = response?.error || "";
            if (error) {
                this.errorMessage = `Error while obtaining a list of mentions:  ${response?.error}`;
            } else {
                this.pages = (response.mentions as ER.Results)?.pages || 0;
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

export class RequestMentions {}

export class RequestMentionsInfo extends RequestMentions {
    public resultType = "mentions";
    public params;
    constructor(args: ER.QueryEvents.RequestEventsInfoArguments = {}) {
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
        if (returnInfo) {
            this.params = {...this.params, ...returnInfo.getParams("mentions")};
        }
    }

    public set page(page: number) {
        if (page < 1) {
            throw new RangeError("Page has to be >= 1");
        }
        this.params["mentionsPage"] = page;
    }
}

export class RequestMentionsUriWgtList extends RequestMentions {
    public resultType = "uriWgtList";
    public params;

    constructor(args: ER.QueryMentions.RequestMentionsUriWgtListArguments = {}) {
        super();
        const {
            page = 1,
            count = 10000,
            sortBy = "fq",
            sortByAsc = false,
            ...unsupported
        } = args;
        if (Object.keys(unsupported).length !== 0) {
            Logger.warn(`RequestMentionsUriWgtList: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
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
        this.params["uriWgtListPage"] = page;
    }
}

export class RequestMentionsTimeAggr extends RequestMentions {
    public resultType = "timeAggr";
}

export class RequestMentionsConceptAggr extends RequestMentions {
    public resultType = "conceptAggr";
    public params;
    constructor(args: ER.QueryMentions.RequestMentionsConceptAggrArguments = {}) {
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
        this.params = {...this.params, ...returnInfo.getParams("conceptAggr")};
    }
}

export class RequestMentionsCategoryAggr extends RequestMentions {
    public resultType = "categoryAggr";
    public params;
    constructor(args: ER.QueryMentions.RequestMentionsCategoryAggrArguments = {}) {
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
    constructor(args: ER.QueryMentions.RequestMentionsSourceAggrArguments = {}) {
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
    constructor(args: ER.QueryMentions.RequestMentionsKeywordAggrArguments = {}) {
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

    constructor(args: ER.QueryMentions.RequestMentionsConceptGraphArguments = {}) {
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
        this.params = {...this.params, ...returnInfo.getParams("conceptGraph")};
    }
}

export class RequestMentionsRecentActivity extends RequestMentions {
    public resultType = "recentActivityMentions";
    public params;
    constructor(args: ER.QueryMentions.RequestMentionsRecentActivityArguments = {}) {
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
        if (updatesAfterTm !== undefined && updatesAfterMinsAgo !== undefined) {
            throw new Error("You should specify either updatesAfterTm or updatesAfterMinsAgo parameter, but not both");
        }
        if (updatesUntilTm !== undefined && updatesUntilMinsAgo !== undefined) {
            throw new Error("You should specify either updatesUntilTm or updatesUntilMinsAgo parameter, but not both");
        }
        this.params = {};
        this.params["recentActivityMentionsMaxMentionCount"] = maxMentionCount;

        if (updatesAfterTm !== undefined) {
            this.params["recentActivityMentionsUpdatesAfterTm"] = QueryParamsBase.encodeDateTime(updatesAfterTm);
        }

        if (updatesAfterMinsAgo !== undefined) {
            this.params["recentActivityMentionsUpdatesAfterMinsAgo"] = updatesAfterMinsAgo;
        }

        if (updatesUntilTm !== undefined) {
            this.params["recentActivityMentionsUpdatesUntilTm"] = QueryParamsBase.encodeDateTime(updatesUntilTm);
        }

        if (updatesUntilMinsAgo !== undefined) {
            this.params["recentActivityMentionsUpdatesUntilMinsAgo"] = updatesUntilMinsAgo;
        }

        if (updatesAfterUri !== undefined) {
            this.params["recentActivityMentionsUpdatesAfterUri"] = updatesAfterUri;
        }

        this.params["recentActivityMentionsMandatorySourceLocation"] = mandatorySourceLocation;

        if (returnInfo !== undefined) {
            this.params = {...this.params, ...returnInfo.getParams("recentActivityMentions")};
        }
    }
}

