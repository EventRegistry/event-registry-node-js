import { Query, QueryParamsBase } from "./base";
import { EventRegistry } from "./eventRegistry";
import { ComplexArticleQuery } from "./query";
import { QueryIterationEngine } from "./queryIterator";
import { ReturnInfo } from "./returnInfo";
import { ER } from "./types";
import { Data } from "./data";
import { Logger } from "./logger";

export class QueryArticles extends Query<RequestArticles> {
    constructor(args: ER.QueryArticles.Arguments = {}) {
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
            keywordSearchMode = "phrase",
            ignoreKeywordsLoc = "body",
            ignoreKeywordSearchMode = "phrase",
            isDuplicateFilter = "keepAll",
            hasDuplicateFilter = "keepAll",
            eventFilter = "keepAll",
            authorsFilter = "keepAll",
            videosFilter = "keepAll",
            linksFilter = "keepAll",
            startSourceRankPercentile = 0,
            endSourceRankPercentile = 100,
            minSentiment = -1,
            maxSentiment = 1,
            dataType = "news",
            requestedResult = new RequestArticlesInfo(),
            ...unsupported
        } = args;
        if (Object.keys(unsupported).length > 0) {
            const unsupportedKeys = ["sortBy", "sortByAsc", "returnInfo", "maxItems"];
            if (!Object.keys(unsupported).some(key => unsupportedKeys.includes(key))) {
                console.warn(`QueryArticles: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
            }
        }
        this.setVal("action", "getArticles");
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
        this.setQueryArrVal(ignoreKeywords, "ignoreKeyword", undefined, "or");
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
        this.setValIfNotDefault("isDuplicateFilter", isDuplicateFilter, "keepAll");
        this.setValIfNotDefault("hasDuplicateFilter", hasDuplicateFilter, "keepAll");
        this.setValIfNotDefault("eventFilter", eventFilter, "keepAll");
        this.setValIfNotDefault("hasAuthorsFilter", authorsFilter, "keepAll");
        this.setValIfNotDefault("hasVideosFilter", videosFilter, "keepAll");
        this.setValIfNotDefault("hasLinksFilter", linksFilter, "keepAll");
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

        this.setValIfNotDefault("dataType", dataType, "news");
        this.setRequestedResult(requestedResult);
    }

    public get path() {
        return "/api/v1/article";
    }

    public setRequestedResult(requestArticles: RequestArticles) {
        if (!(requestArticles instanceof RequestArticles)) {
            throw new Error("QueryArticles class can only accept result requests that are of type RequestArticles");
        }
        this.resultTypeList = [requestArticles];
    }

    public static initWithArticleUriList(uriList: string[]) {
        const q = new QueryArticles();
        if (!Array.isArray(uriList)) {
            throw new Error("uriList has to be a list of strings that represent article uris");
        }
        q.params = {
            action: "getArticles",
            articleUri: uriList
        };
        return q;
    }

    public static initWithArticleUriWgtList(uriWgtList: string[]) {
        const q = new QueryArticles();
        if (!Array.isArray(uriWgtList)) {
            throw new Error("uriList has to be a list of strings that represent article uris");
        }
        q.params = {
            action: "getArticles",
            articleUriWgtList: uriWgtList.join(",")
        };
        return q;
    }

    public static initWithComplexQuery(...args: unknown[]) {
        const complexQuery = args[0] as ComplexArticleQuery | string | Record<string, unknown>;
        const query = new QueryArticles();
        if (complexQuery instanceof ComplexArticleQuery) {
            query.setVal("query", JSON.stringify(complexQuery.getQuery()));
        } else if (typeof complexQuery === "string") {
            try {
                JSON.parse(complexQuery);
            } catch {
                console.error("Failed to parse the provided string content as a JSON object. Please check the content provided as a parameter to the initWithComplexQuery() method");
            }
            query.setVal("query", complexQuery);
        } else if (typeof complexQuery === "object" && complexQuery !== null) {
            query.setVal("query", JSON.stringify(complexQuery));
        } else {
            throw new Error("The instance of query parameter was not a ComplexArticleQuery, a string or an object");
        }
        return query;
    }

}

export class QueryArticlesIter extends QueryArticles implements AsyncIterable<Data.Article>  {
    private readonly er: EventRegistry;
    private readonly engine: QueryIterationEngine<Data.Article>;

    constructor(er: EventRegistry, args: ER.QueryArticles.IteratorArguments = {}) {
        super(args);
        const {
            sortBy = "rel",
            sortByAsc = false,
            returnInfo = undefined,
            maxItems = -1
        } = args;
        this.er = er;
        this.engine = new QueryIterationEngine<Data.Article>({
            maxItems,
            entityLabel: "articles",
            onError: (message) => this.er.logger.error(message),
            fetchPage: async (page) => {
                const requestArticles = new RequestArticlesInfo({ page, sortBy, sortByAsc, returnInfo });
                this.setRequestedResult(requestArticles);
                if (this.er.verboseOutput) {
                    this.er.logger.info(`Downloading article page ${page}...`);
                }
                const response = await this.er.execQuery(this, this.er.allowUseOfArchive);
                return {
                    results: (response.articles as ER.Results<Data.Article>)?.results || [],
                    pages: (response.articles as ER.Results)?.pages || 0,
                    error: response.error || undefined
                };
            }
        });
    }

    /**
     * Async Iterator function that returns the next item in the list of articles
     */
    [Symbol.asyncIterator](): AsyncIterator<Data.Article> {
        return this.engine[Symbol.asyncIterator]();
    }

    public async count(): Promise<number> {
        this.setRequestedResult(new RequestArticlesInfo());
        const response = await this.er.execQuery(this);

        if (response.error) {
            this.er.logger.error(response.error);
        }

        return (response.articles as ER.Results)?.totalResults || 0;
    }

    public execQuery(callback: (item: Data.Article) => void, doneCallback?: (error?: string) => void): void {
        this.engine.execQuery(callback, doneCallback);
    }

    public static initWithComplexQuery(er: EventRegistry, complexQuery: ComplexArticleQuery | string | Record<string, unknown>, params: ER.QueryArticles.IteratorArguments = {}): QueryArticlesIter {
        const query = new QueryArticlesIter(er, params);
        if (complexQuery instanceof ComplexArticleQuery) {
            query.setVal("query", JSON.stringify(complexQuery.getQuery()));
        } else if (typeof complexQuery === 'string') {
            query.setVal("query", complexQuery);
        } else if (typeof complexQuery === 'object' && complexQuery !== null) {
            query.setVal("query", JSON.stringify(complexQuery));
        } else {
            throw new Error("The instance of query parameter was not a ComplexArticleQuery, a string or an object");
        }
        return query;
    }

}

export class RequestArticles {}

export class RequestArticlesInfo extends RequestArticles {
    public resultType = "articles";
    public params: Record<string, unknown>;
    constructor (parameters: ER.RequestArticlesInfoParameters = {}) {
        super();
        const {
            page = 1,
            count = 100,
            sortBy = "date",
            sortByAsc = false,
            returnInfo,
            ...unsupported
        } = parameters;
        if (Object.keys(unsupported).length !== 0) {
            Logger.warn(`RequestArticlesInfo: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        if (page < 1) {
            throw new RangeError("page has to be >= 1");
        }
        if (count > 200) {
            throw new RangeError("at most 200 articles can be returned per call");
        }
        this.params = {};
        this.params["articlesPage"] = page;
        this.params["articlesCount"] = count;
        this.params["articlesSortBy"] = sortBy;
        this.params["articlesSortByAsc"] = sortByAsc;
        if (returnInfo) {
            this.params = {...this.params, ...returnInfo.getParams("articles")};
        }
    }
}

export class RequestArticlesUriWgtList extends RequestArticles {
    public resultType = "uriWgtList";
    public params: Record<string, unknown>;
    constructor(parameters: ER.RequestArticlesUriWgtListParameters = {}) {
        super();
        const {
            page = 1,
            count = 10000,
            sortBy = "fq",
            sortByAsc = false,
            ...unsupported
        } = parameters;

        if (Object.keys(unsupported).length !== 0) {
            Logger.warn(`RequestArticlesUriWgtList: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        if (page < 1) {
            throw new RangeError("page has to be >= 1");
        }
        if (count > 50000) {
            throw new RangeError("at most 50000 items can be returned per call");
        }
        this.params = {};
        this.params["uriWgtListPage"] = page;
        this.params["uriWgtListCount"] = count;
        this.params["uriWgtListSortBy"] = sortBy;
        this.params["uriWgtListSortByAsc"] = sortByAsc;
    }

    public setPage(page: number) {
        if (page < 1) {
            throw new RangeError("page has to be >= 1");
        }
        this.params["uriWgtListPage"] = page;
    }
}

export class RequestArticlesTimeAggr extends RequestArticles {
    public resultType = "timeAggr";
}

export class RequestArticlesConceptAggr extends RequestArticles {
    public resultType = "conceptAggr";
    public params: Record<string, unknown>;
    constructor({
                 conceptCount = 25,
                 conceptCountPerType = undefined,
                 conceptScoring = "importance",
                 articlesSampleSize = 10000,
                 returnInfo = new ReturnInfo(),
                 ...unsupported
                } = {}) {
        super();
        if (Object.keys(unsupported).length !== 0) {
            Logger.warn(`RequestArticlesConceptAggr: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        if (conceptCount > 500) {
            throw new RangeError("At most 500 concepts can be returned per call");
        }
        if (articlesSampleSize > 20000) {
            throw new RangeError("at most 20000 articles can be used for computation sample");
        }
        this.params = {};
        this.params["conceptAggrConceptCount"] = conceptCount;
        this.params["conceptAggrSampleSize"] = articlesSampleSize;
        this.params["conceptAggrScoring"] = conceptScoring;
        if (conceptCountPerType !== undefined) {
            this.params["conceptAggrConceptCountPerType"] = conceptCountPerType;
        }
        this.params = {...this.params, ...returnInfo.getParams("conceptAggr")};
    }
}

export class RequestArticlesCategoryAggr extends RequestArticles {
    public resultType = "categoryAggr";
    public params: Record<string, unknown>;
    constructor({articlesSampleSize = 20000,
                 returnInfo = new ReturnInfo(),
                 ...unsupported
                } = {}) {
        super();
        if (Object.keys(unsupported).length !== 0) {
            Logger.warn(`RequestArticlesCategoryAggr: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        if (articlesSampleSize > 50000) {
            throw new RangeError("at most 50000 articles can be used for computation sample");
        }
        this.params = {};
        this.params["categoryAggrSampleSize"] = articlesSampleSize;
        this.params = {...this.params, ...returnInfo.getParams("categoryAggr")};
    }
}

export class RequestArticlesSourceAggr extends RequestArticles {
    public resultType = "sourceAggr";
    public params: Record<string, unknown>;
    constructor({
                 sourceCount = 50,
                 normalizeBySourceArts = false,
                 returnInfo = new ReturnInfo(),
                 ...unsupported
                } = {}) {
        super();
        if (Object.keys(unsupported).length !== 0) {
            Logger.warn(`RequestArticlesSourceAggr: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        this.params = {};
        this.params["sourceAggrSourceCount"] = sourceCount;
        if (normalizeBySourceArts) {
            this.params["sourceAggrNormalizeBySourceArts"] = normalizeBySourceArts;
        }
        this.params = {...this.params, ...returnInfo.getParams("sourceAggr")};
    }
}

export class RequestArticlesKeywordAggr extends RequestArticles {
    public resultType = "keywordAggr";
    public params: Record<string, unknown>;
    constructor({
                 articlesSampleSize = 2000,
                 ...unsupported
                } = {}) {
        super();
        if (Object.keys(unsupported).length !== 0) {
            Logger.warn(`RequestArticlesKeywordAggr: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        if (articlesSampleSize > 20000) {
            throw new RangeError("at most 20000 articles can be used for computation sample");
        }
        this.params = {};
        this.params["keywordAggrSampleSize"] = articlesSampleSize;
    }
}

export class RequestArticlesConceptGraph extends RequestArticles {
    public resultType = "conceptGraph";
    public params: Record<string, unknown>;
    constructor({conceptCount = 25,
                 linkCount = 50,
                 articlesSampleSize = 10000,
                 skipQueryConcepts = true,
                 returnInfo = new ReturnInfo(),
                 ...unsupported
                } = {}) {
        super();
        if (Object.keys(unsupported).length !== 0) {
            Logger.warn(`RequestArticlesConceptGraph: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        if (conceptCount > 1000) {
            throw new RangeError("At most 1000 concepts can be returned per call");
        }
        if (linkCount > 2000) {
            throw new RangeError("at most 2000 links can be returned per call");
        }
        if (articlesSampleSize > 50000) {
            throw new RangeError("at most 50000 results can be used for computation sample");
        }
        this.params = {};
        this.params["conceptGraphConceptCount"] = conceptCount;
        this.params["conceptGraphLinkCount"] = linkCount;
        this.params["conceptGraphSampleSize"] = articlesSampleSize;
        this.params["conceptGraphSkipQueryConcepts"] = skipQueryConcepts;
        this.params = {...this.params, ...returnInfo.getParams("conceptGraph")};
    }
}

export class RequestArticlesConceptMatrix extends RequestArticles {
    public resultType = "conceptMatrix";
    public params: Record<string, unknown>;
    constructor({conceptCount = 25,
                 measure = "pmi",
                 articlesSampleSize = 10000,
                 returnInfo = new ReturnInfo(),
                 ...unsupported
                } = {}) {
        super();
        if (Object.keys(unsupported).length !== 0) {
            Logger.warn(`RequestArticlesConceptMatrix: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        if (conceptCount > 200) {
            throw new RangeError("At most 200 concepts can be returned per call");
        }
        if (articlesSampleSize > 50000) {
            throw new RangeError("at most 50000 results can be used for computation sample");
        }
        this.params = {};
        this.params["conceptMatrixConceptCount"] = conceptCount;
        this.params["conceptMatrixMeasure"] = measure;
        this.params["conceptMatrixSampleSize"] = articlesSampleSize;
        this.params = {...this.params, ...returnInfo.getParams("conceptMatrix")};
    }
}

export class RequestArticlesConceptTrends extends RequestArticles {
    public resultType = "conceptTrends";
    public params: Record<string, unknown>;
    constructor(parameters: ER.RequestArticlesConceptTrendsParameters = {}) {
        super();
        const {
            conceptUris,
            conceptCount = 25,
            articlesSampleSize = 10000,
            returnInfo = new ReturnInfo(),
            ...unsupported
        } = parameters;
        if (Object.keys(unsupported).length !== 0) {
            Logger.warn(`RequestArticlesConceptTrends: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        if (conceptCount > 50) {
            throw new RangeError("At most 50 concepts can be returned per call");
        }
        if (articlesSampleSize > 50000) {
            throw new RangeError("at most 50000 results can be used for computation sample");
        }
        this.params = {};
        if (conceptUris !== undefined) {
            this.params["conceptTrendsConceptUri"] = conceptUris;
        }
        this.params["conceptTrendsConceptCount"] = conceptCount;
        this.params["conceptTrendsSampleSize"] = articlesSampleSize;
        this.params = {...this.params, ...returnInfo.getParams("conceptTrends")};
    }
}

export class RequestArticlesDateMentionAggr extends RequestArticles {
    public resultType = "dateMentionAggr";
}

export class RequestArticlesRecentActivity extends RequestArticles {
    public resultType = "recentActivityArticles";
    public params: Record<string, unknown>;
    constructor({maxArticleCount = 100,
                 updatesAfterNewsUri = undefined,
                 updatesafterBlogUri = undefined,
                 updatesAfterPrUri = undefined,
                 updatesAfterTm = undefined,
                 updatesAfterMinsAgo = undefined,
                 updatesUntilTm = undefined,
                 updatesUntilMinsAgo = undefined,
                 mandatorySourceLocation = false,
                 returnInfo = undefined,
                 ...unsupported
                }: ER.RequestArticlesRecentActivityParameters = {}) {
        super();
        if (Object.keys(unsupported).length !== 0) {
            Logger.warn(`RequestArticlesRecentActivity: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        if (maxArticleCount > 2000) {
            throw new RangeError("At most 2000 articles can be returned per call");
        }
        if (updatesAfterTm !== undefined && updatesAfterMinsAgo !== undefined) {
            throw new Error("You should specify either updatesAfterTm or updatesAfterMinsAgo parameter, but not both");
        }
        if (updatesUntilTm !== undefined && updatesUntilMinsAgo !== undefined) {
            throw new Error("You should specify either updatesUntilTm or updatesUntilMinsAgo parameter, but not both");
        }
        this.params = {};
        this.params["recentActivityArticlesMaxArticleCount"] = maxArticleCount;
        if (updatesAfterTm !== undefined) {
            this.params["recentActivityArticlesUpdatesAfterTm"] = QueryParamsBase.encodeDateTime(updatesAfterTm);
        }
        if (updatesAfterMinsAgo !== undefined) {
            this.params["recentActivityArticlesUpdatesAfterMinsAgo"] = updatesAfterMinsAgo;
        }
        if (updatesUntilTm !== undefined) {
            this.params["recentActivityArticlesUpdatesUntilTm"] = QueryParamsBase.encodeDateTime(updatesUntilTm);
        }
        if (updatesUntilMinsAgo !== undefined) {
            this.params["recentActivityArticlesUpdatesUntilMinsAgo"] = updatesUntilMinsAgo;
        }
        if (updatesAfterNewsUri !== undefined) {
            this.params["recentActivityArticlesNewsUpdatesAfterUri"] = updatesAfterNewsUri;
        }
        if (updatesafterBlogUri !== undefined) {
            this.params["recentActivityArticlesNewsUpdatesAfterUri"] = updatesafterBlogUri;
        }
        if (updatesAfterPrUri !== undefined) {
            this.params["recentActivityArticlesNewsUpdatesAfterUri"] = updatesAfterPrUri;
        }
        this.params["recentActivityArticlesMandatorySourceLocation"] = mandatorySourceLocation;
        if (returnInfo) {
            this.params = {...this.params, ...returnInfo.getParams("recentActivityArticles")};
        }
    }
}
