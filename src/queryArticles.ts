import * as _ from "lodash";
import { mainLangs, Query, QueryParamsBase } from "./base";
import { EventRegistry } from "./eventRegistry";
import { ComplexArticleQuery } from "./query";
import { ArticleInfoFlags, ReturnInfo } from "./returnInfo";
import { EventRegistryStatic } from "./types";

export class QueryArticles extends Query<RequestArticles> {
    constructor(args: EventRegistryStatic.QueryArticles.Arguments = {}) {
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
            ignoreKeywordsLoc = "body",
            isDuplicateFilter = "keepAll",
            hasDuplicateFilter = "keepAll",
            eventFilter = "keepAll",
            startSourceRankPercentile = 0,
            endSourceRankPercentile = 100,
            dataType = "news",
            requestedResult = new RequestArticlesInfo(),
            ...unsupported
        } = args;
        if (!_.isEmpty(unsupported)) {
            // Check ["sortBy", "sortByAsc", "returnInfo", "maxItems"] for cases when we are coming from QueryArticlesIter
            if (!_.some(_.keys(unsupported), (key) => _.includes(["sortBy", "sortByAsc", "returnInfo", "maxItems"], key))) {
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
        this.setValIfNotDefault("isDuplicateFilter", isDuplicateFilter, "keepAll");
        this.setValIfNotDefault("hasDuplicateFilter", hasDuplicateFilter, "keepAll");
        this.setValIfNotDefault("eventFilter", eventFilter, "keepAll");
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

        this.setVal("dataType", dataType);
        this.setRequestedResult(requestedResult);
    }

    public get path() {
        return "/json/article";
    }

    public setRequestedResult(requestArticles) {
        if (!(requestArticles instanceof RequestArticles)) {
            throw new Error("QueryArticles class can only accept result requests that are of type RequestArticles");
        }
        this.resultTypeList = [requestArticles];
    }

    public static initWithArticleUriList(...args);
    public static initWithArticleUriList(uriList) {
        const q = new QueryArticles();
        if (!_.isArray(uriList)) {
            throw new Error("uriList has to be a list of strings that represent article uris");
        }
        q.params = {
            action: "getArticles",
            articleUri: uriList,
        };
        return q;
    }

    public static initWithArticleUriWgtList(...args);
    public static initWithArticleUriWgtList(uriWgtList) {
        const q = new QueryArticles();
        if (!_.isArray(uriWgtList)) {
            throw new Error("uriList has to be a list of strings that represent article uris");
        }
        q.params = {
            action: "getArticles",
            articleUriWgtList: _.join(uriWgtList, ","),
        };
        return q;
    }

    public static initWithComplexQuery(...args);
    public static initWithComplexQuery(complexQuery) {
        const query = new QueryArticles();
        if (complexQuery instanceof ComplexArticleQuery) {
            query.setVal("query", JSON.stringify(complexQuery.getQuery()));
        } else if (_.isString(complexQuery)) {
            query.setVal("query", complexQuery);
        } else if (_.isObject(complexQuery)) {
            query.setVal("query", JSON.stringify(complexQuery));
        } else {
            throw new Error("The instance of query parameter was not a ComplexArticleQuery, a string or an object");
        }
        return query;
    }

}

export class QueryArticlesIter extends QueryArticles {
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

    constructor(er: EventRegistry, args: {[name: string]: any} = {}) {
        super(args);
        _.defaults(args, {
            sortBy: "rel",
            sortByAsc: false,
            returnInfo: new ReturnInfo(),
            maxItems: -1,
        });
        const {sortBy, sortByAsc, returnInfo, maxItems} = args;
        this.er = er;
        this.sortBy = sortBy;
        this.sortByAsc = sortByAsc;
        this.returnInfo = returnInfo;
        this.maxItems = maxItems;
    }

    public async count() {
        this.setRequestedResult(new RequestArticlesInfo());
        const response = await this.er.execQuery(this);

        if (_.has(response, "error")) {
            console.error(_.get(response, "error"));
        }

        return _.get(response, "articles.totalResults", 0);
    }

    public execQuery(callback: (item) => void, doneCallback?: (error?) => void) {
        if (callback) { this.callback = callback; }
        if (doneCallback) { this.doneCallback = doneCallback; }
        this.iterate();
    }

    public static initWithComplexQuery(er: EventRegistry, complexQuery, args: {[name: string]: any} = {}) {
        const {dataType = "news", ...params} = args;
        const query = new QueryArticlesIter(er, {dataType, ...params});
        if (complexQuery instanceof ComplexArticleQuery) {
            query.setVal("query", JSON.stringify(complexQuery.getQuery()));
        } else if (_.isString(complexQuery)) {
            query.setVal("query", complexQuery);
        } else if (_.isObject(complexQuery)) {
            query.setVal("query", JSON.stringify(complexQuery));
        } else {
            throw new Error("The instance of query parameter was not a ComplexArticleQuery, a string or an object");
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
        const results = _.get(response, "articles.results", []);
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
            const requestArticles = new RequestArticlesInfo({
                page: this.page,
                sortBy: this.sortBy,
                sortByAsc: this.sortByAsc,
                returnInfo: this.returnInfo,
            });
            this.setRequestedResult(requestArticles);
            if (this.er.verboseOutput) {
                console.log(`Downloading article page ${this.page}...`);
            }
            const response = await this.er.execQuery(this);
            const error = _.get(response, "error", "");
            if (error) {
                this.errorMessage = `Error while obtaining a list of articles:  ${this.errorMessage}`;
            } else {
                this.pages = _.get(response, "articles.pages", 0);
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

export class RequestArticles {}

export class RequestArticlesInfo extends RequestArticles {
    public resultType = "articles";
    public params;
    constructor({page = 1,
                 count = 200,
                 sortBy = "date",
                 sortByAsc = false,
                 returnInfo = new ReturnInfo(),
                 ...unsupported
                } = {}) {
        super();
        if (!_.isEmpty(unsupported)) {
            console.warn(`RequestArticlesInfo: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
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
        this.params = _.extend({}, this.params, returnInfo.getParams("articles"));
    }
}

export class RequestArticlesUriWgtList extends RequestArticles {
    public resultType = "uriWgtList";
    public params;
    constructor({page = 1,
                 count = 10000,
                 sortBy = "fq",
                 sortByAsc = false,
                 ...unsupported
                } = {}) {
        super();
        if (!_.isEmpty(unsupported)) {
            console.warn(`RequestArticlesUriWgtList: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
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

    public setPage(page) {
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
    public params;
    constructor({
                 conceptCount = 25,
                 conceptCountPerType = undefined,
                 conceptScoring = "importance",
                 articlesSampleSize = 10000,
                 returnInfo = new ReturnInfo(),
                 ...unsupported
                } = {}) {
        super();
        if (!_.isEmpty(unsupported)) {
            console.warn(`RequestArticlesConceptAggr: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
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
        if (!_.isUndefined(conceptCountPerType)) {
            this.params["conceptAggrConceptCountPerType"] = conceptCountPerType;
        }
        this.params = _.extend({}, this.params, returnInfo.getParams("conceptAggr"));
    }
}

export class RequestArticlesCategoryAggr extends RequestArticles {
    public resultType = "categoryAggr";
    public params;
    constructor({articlesSampleSize = 20000,
                 returnInfo = new ReturnInfo(),
                 ...unsupported
                } = {}) {
        super();
        if (!_.isEmpty(unsupported)) {
            console.warn(`RequestArticlesCategoryAggr: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        if (articlesSampleSize > 50000) {
            throw new RangeError("at most 50000 articles can be used for computation sample");
        }
        this.params = {};
        this.params["categoryAggrSampleSize"] = articlesSampleSize;
        this.params = _.extend({}, this.params, returnInfo.getParams("categoryAggr"));
    }
}

export class RequestArticlesSourceAggr extends RequestArticles {
    public resultType = "sourceAggr";
    public params;
    constructor({
                 articlesSampleSize = 20000,
                 sourceCount = 50,
                 normalizeBySourceArts = false,
                 returnInfo = new ReturnInfo(),
                 ...unsupported
                } = {}) {
        super();
        if (!_.isEmpty(unsupported)) {
            console.warn(`RequestArticlesSourceAggr: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        if (articlesSampleSize > 1000000) {
            throw new RangeError("at most 1000000 articles can be used for computation sample");
        }
        this.params = {};
        this.params["sourceAggrSourceCount"] = sourceCount;
        this.params["sourceAggrSampleSize"] = articlesSampleSize;
        this.params = _.extend({}, this.params, returnInfo.getParams("sourceAggr"));
    }
}

export class RequestArticlesKeywordAggr extends RequestArticles {
    public resultType = "keywordAggr";
    public params;
    constructor({
                 articlesSampleSize = 2000,
                 ...unsupported
                } = {}) {
        super();
        if (!_.isEmpty(unsupported)) {
            console.warn(`RequestArticlesKeywordAggr: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
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
    public params;
    constructor({conceptCount = 25,
                 linkCount = 50,
                 articlesSampleSize = 10000,
                 skipQueryConcepts = true,
                 returnInfo = new ReturnInfo(),
                 ...unsupported
                } = {}) {
        super();
        if (!_.isEmpty(unsupported)) {
            console.warn(`RequestArticlesConceptGraph: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
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
        this.params = _.extend({}, this.params, returnInfo.getParams("conceptGraph"));
    }
}

export class RequestArticlesConceptMatrix extends RequestArticles {
    public resultType = "conceptMatrix";
    public params;
    constructor({conceptCount = 25,
                 measure = "pmi",
                 articlesSampleSize = 10000,
                 returnInfo = new ReturnInfo(),
                 ...unsupported
                } = {}) {
        super();
        if (!_.isEmpty(unsupported)) {
            console.warn(`RequestArticlesConceptMatrix: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
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
        this.params = _.extend({}, this.params, returnInfo.getParams("conceptMatrix"));
    }
}

export class RequestArticlesConceptTrends extends RequestArticles {
    public resultType = "conceptTrends";
    public params;
    constructor({
                 conceptUris = undefined,
                 conceptCount = 25,
                 articlesSampleSize = 10000,
                 returnInfo = new ReturnInfo(),
                 ...unsupported
                } = {}) {
        super();
        if (!_.isEmpty(unsupported)) {
            console.warn(`RequestArticlesConceptTrends: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        if (conceptCount > 50) {
            throw new RangeError("At most 50 concepts can be returned per call");
        }
        if (articlesSampleSize > 50000) {
            throw new RangeError("at most 50000 results can be used for computation sample");
        }
        this.params = {};
        if (!_.isUndefined(conceptUris)) {
            this.params["conceptTrendsConceptUri"] = conceptUris;
        }
        this.params["conceptTrendsConceptCount"] = conceptCount;
        this.params["conceptTrendsSampleSize"] = articlesSampleSize;
        this.params = _.extend({}, this.params, returnInfo.getParams("conceptTrends"));
    }
}

export class RequestArticlesDateMentionAggr extends RequestArticles {
    public resultType = "dateMentionAggr";
}

export class RequestArticlesRecentActivity extends RequestArticles {
    public resultType = "recentActivityArticles";
    public params;
    constructor({maxArticleCount = 100,
                 updatesAfterTm = undefined,
                 updatesAfterMinsAgo = undefined,
                 updatesUntilTm = undefined,
                 updatesUntilMinsAgo = undefined,
                 mandatorySourceLocation = false,
                 returnInfo = new ReturnInfo(),
                 ...unsupported
                } = {}) {
        super();
        if (!_.isEmpty(unsupported)) {
            console.warn(`RequestArticlesRecentActivity: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        if (maxArticleCount > 1000) {
            throw new RangeError("At most 1000 articles can be returned per call");
        }
        if (!_.isUndefined(updatesAfterTm) && !_.isUndefined(updatesAfterMinsAgo)) {
            throw new Error("You should specify either updatesAfterTm or updatesAfterMinsAgo parameter, but not both");
        }
        if (!_.isUndefined(updatesUntilTm) && !_.isUndefined(updatesUntilMinsAgo)) {
            throw new Error("You should specify either updatesUntilTm or updatesUntilMinsAgo parameter, but not both");
        }
        this.params = {};
        this.params["recentActivityArticlesMaxArticleCount"] = maxArticleCount;
        if (!_.isUndefined(updatesAfterTm)) {
            this.params["recentActivityArticlesUpdatesAfterTm"] = QueryParamsBase.encodeDateTime(updatesAfterTm);
        }
        if (!_.isUndefined(updatesAfterMinsAgo)) {
            this.params["recentActivityArticlesUpdatesAfterMinsAgo"] = updatesAfterMinsAgo;
        }
        if (!_.isUndefined(updatesUntilTm)) {
            this.params["recentActivityArticlesUpdatesUntilTm"] = QueryParamsBase.encodeDateTime(updatesUntilTm);
        }
        if (!_.isUndefined(updatesUntilMinsAgo)) {
            this.params["recentActivityArticlesUpdatesUntilMinsAgo"] = updatesUntilMinsAgo;
        }
        this.params["recentActivityArticlesMandatorySourceLocation"] = mandatorySourceLocation;
        this.params = _.extend({}, this.params, returnInfo.getParams("recentActivityArticles"));
    }
}
