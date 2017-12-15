import * as _ from "lodash";
import { mainLangs, Query, QueryParamsBase } from "./base";
import { EventRegistry } from "./eventRegistry";
import { ComplexArticleQuery } from "./query";
import { ArticleInfoFlags, ReturnInfo } from "./returnInfo";
import { ER } from "./types";

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
            ignoreLocationUri,
            ignoreLang,
            keywordsLoc = "body",
            ignoreKeywordsLoc = "body",
            categoryIncludeSub = true,
            ignoreCategoryIncludeSub = true,
            isDuplicateFilter = "keepAll",
            hasDuplicateFilter = "keepAll",
            eventFilter = "keepAll",
            requestedResult = new RequestArticlesInfo(),
        } = args;
        this.setVal("action", "getArticles");
        this.setQueryArrVal(keywords, "keyword", "keywordOper", "and");
        this.setQueryArrVal(conceptUri, "conceptUri", "conceptOper", "and");
        this.setQueryArrVal(categoryUri, "categoryUri", "categoryOper", "or");
        this.setQueryArrVal(sourceUri, "sourceUri", "sourceOper", "or");
        this.setQueryArrVal(sourceLocationUri, "sourceLocationUri", undefined, "or");
        this.setQueryArrVal(sourceGroupUri, "sourceGroupUri", "sourceGroupOper", "or");
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
        this.setQueryArrVal(ignoreLocationUri, "ignoreLocationUri", undefined, "or");
        this.setQueryArrVal(ignoreLang, "ignoreLang", undefined, "or");
        this.setValIfNotDefault("keywordLoc", keywordsLoc, "body");
        this.setValIfNotDefault("ignoreKeywordLoc", ignoreKeywordsLoc, "body");
        this.setValIfNotDefault("categoryIncludeSub", categoryIncludeSub, true);
        this.setValIfNotDefault("ignoreCategoryIncludeSub", ignoreCategoryIncludeSub, true);
        this.setValIfNotDefault("isDuplicateFilter", isDuplicateFilter, "keepAll");
        this.setValIfNotDefault("hasDuplicateFilter", hasDuplicateFilter, "keepAll");
        this.setValIfNotDefault("eventFilter", eventFilter, "keepAll");
        this.addRequestedResult(requestedResult);
    }

    public get path() {
        return "/json/article";
    }

    public addRequestedResult(requestArticles) {
        if (!(requestArticles instanceof RequestArticles)) {
            throw new Error("QueryArticles class can only accept result requests that are of type RequestArticles");
        }
        this.resultTypeList = [..._.filter(this.resultTypeList, (item) => item["resultType"] !== requestArticles["resultType"]), requestArticles];
    }

    public setRequestedResult(requestArticles) {
        if (!(requestArticles instanceof RequestArticles)) {
            throw new Error("QueryArticles class can only accept result requests that are of type RequestArticles");
        }
        this.resultTypeList = [requestArticles];
    }

    public static initWithArticleUriList(uriList) {
        const q = new QueryArticles();
        if (!_.isArray(uriList)) {
            throw new Error("uriList has to be a list of strings that represent article uris");
        }
        q.setVal("action", "getArticles");
        q.setVal("articleUri", uriList);
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
    private er;
    private sortBy;
    private sortByAsc;
    private returnInfo;
    private articleBatchSize;
    private uriPage = 0;
    private returnedDataSize = 0;
    private maxItems;
    private uriWgtList = [];
    private allUriPages;

    constructor(er, args: {[name: string]: any} = {}) {
        super(args);
        _.defaults(args, {
            sortBy: "rel",
            sortByAsc: false,
            returnInfo: new ReturnInfo(),
            articleBatchSize: 200,
            maxItems: -1,
        });
        const {sortBy, sortByAsc, returnInfo, articleBatchSize, maxItems} = args;
        if (articleBatchSize > 200) {
            throw new Error("You can not have a batch size > 200 items");
        }
        this.er = er;
        this.sortBy = sortBy;
        this.sortByAsc = sortByAsc;
        this.returnInfo = returnInfo;
        this.articleBatchSize = articleBatchSize;
        this.maxItems = maxItems;
    }

    public execQuery(callback: (item, error) => void, doneCallback?: (error) => void) {
        this.getNextBatch(callback, doneCallback);
    }

    public static initWithComplexQuery(er: EventRegistry, complexQuery, args: {[name: string]: any} = {}) {
        const query = new QueryArticlesIter(er, args);
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

    private async getNextUriPage() {
        this.uriPage++;
        this.uriWgtList = [];
        if (!this.allUriPages && this.uriPage > this.allUriPages) {
            return;
        }
        const requestArticlesUriWgtList = new RequestArticlesUriWgtList({page: this.uriPage, sortBy: this.sortBy, sortByAsc: this.sortByAsc});
        this.setRequestedResult(requestArticlesUriWgtList);
        const res = await this.er.execQuery(this);
        this.uriWgtList = _.get(res, "uriWgtList.results", []);
        this.allUriPages = _.get(res, "uriWgtList.pages", 0);
    }

    private get batchSize() {
        if (this.maxItems === -1) {
            return this.articleBatchSize;
        }
        const toReturnSize = this.maxItems - this.returnedDataSize;
        return toReturnSize < this.articleBatchSize ? toReturnSize : this.articleBatchSize;
    }

    private async getNextBatch(callback, doneCallback) {
        this.clearRequestedResults();
        if (_.isEmpty(this.uriWgtList)) {
            await this.getNextUriPage();
        }
        if (_.isEmpty(this.uriWgtList) || (this.maxItems !== -1 && this.maxItems === this.returnedDataSize)) {
            if (doneCallback) {
                doneCallback();
            }
            return;
        }
        const uriWgts = _.take(this.uriWgtList, this.batchSize);
        const uris = _.map(uriWgts, (uriWgt: string) => _.first(_.split(uriWgt, ":")));
        this.uriWgtList = _.drop(this.uriWgtList, this.batchSize);
        const q = QueryArticles.initWithArticleUriList(uris);
        const requestArticlesInfo = new RequestArticlesInfo({count: this.batchSize, sortBy: "none", returnInfo: this.returnInfo});
        q.setRequestedResult(requestArticlesInfo);
        const res = await this.er.execQuery(q);
        this.returnedDataSize += _.size(uris);
        callback(_.get(res, "articles.results"), _.get(res, "error"));
        if (this.uriPage <= this.allUriPages) {
            this.getNextBatch(callback, doneCallback);
        }
    }
}

export class RequestArticles {}

export class RequestArticlesInfo extends RequestArticles {
    public resultType = "articles";
    public params;
    constructor({page = 1,
                 count = 20,
                 sortBy = "date",
                 sortByAsc = false,
                 returnInfo = new ReturnInfo(),
                } = {}) {
        super();
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

export class RequestArticlesUriList extends RequestArticles {
    public resultType = "uriList";
    public params;
    constructor({page = 1,
                 count = 10000,
                 sortBy = "fq",
                 sortByAsc = false,
                } = {}) {
        super();
        if (page < 1) {
            throw new RangeError("page has to be >= 1");
        }
        if (count > 50000) {
            throw new RangeError("at most 50000 items can be returned per call");
        }
        this.params = {};
        this.params["uriListPage"] = page;
        this.params["uriListCount"] = count;
        this.params["uriListSortBy"] = sortBy;
        this.params["uriListSortByAsc"] = sortByAsc;
    }

    public setPage(page) {
        if (page < 1) {
            throw new RangeError("page has to be >= 1");
        }
        this.params["uriListPage"] = page;
    }
}

export class RequestArticlesUriWgtList extends RequestArticles {
    public resultType = "uriWgtList";
    public params;
    constructor({page = 1,
                 count = 10000,
                 sortBy = "fq",
                 sortByAsc = false,
                } = {}) {
        super();
        if (page < 1) {
            throw new RangeError("page has to be >= 1");
        }
        if (count > 50000) {
            throw new RangeError("at most 50000 items can be returned per call");
        }
        this.params = {};
        this.params["uriWgtListPage"] = page;
        this.params["uriListCount"] = count;
        this.params["uriListSortBy"] = sortBy;
        this.params["uriListSortByAsc"] = sortByAsc;
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
    constructor({conceptCount = 25,
                 articlesSampleSize = 10000,
                 returnInfo = new ReturnInfo(),
                } = {}) {
        super();
        if (conceptCount > 500) {
            throw new RangeError("At most 500 concepts can be returned per call");
        }
        if (articlesSampleSize > 20000) {
            throw new RangeError("at most 20000 articles can be used for computation sample");
        }
        this.params = {};
        this.params["conceptAggrConceptCount"] = conceptCount;
        this.params["conceptAggrSampleSize"] = articlesSampleSize;
        this.params = _.extend({}, this.params, returnInfo.getParams("conceptAggr"));
    }
}

export class RequestArticlesCategoryAggr extends RequestArticles {
    public resultType = "categoryAggr";
    public params;
    constructor({articlesSampleSize = 20000,
                 returnInfo = new ReturnInfo(),
                } = {}) {
        super();
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
    constructor({articlesSampleSize = 20000,
                 returnInfo = new ReturnInfo(),
                } = {}) {
        super();
        if (articlesSampleSize > 1000000) {
            throw new RangeError("at most 1000000 articles can be used for computation sample");
        }
        this.params = {};
        this.params["sourceAggrSampleSize"] = articlesSampleSize;
        this.params = _.extend({}, this.params, returnInfo.getParams("sourceAggr"));
    }
}

export class RequestArticlesKeywordAggr extends RequestArticles {
    public resultType = "keywordAggr";
    public params;
    constructor({lang = "eng",
                 articlesSampleSize = 10000,
                } = {}) {
        super();
        if (articlesSampleSize > 50000) {
            throw new RangeError("at most 50000 articles can be used for computation sample");
        }
        this.params = {};
        this.params["keywordAggrLang"] = lang;
        this.params["keywordAggrSampleSize"] = articlesSampleSize;
    }
}

export class RequestArticlesConceptGraph extends RequestArticles {
    public resultType = "conceptGraph";
    public params;
    constructor({conceptCount = 25,
                 linkCount = 50,
                 articlesSampleSize = 10000,
                 returnInfo = new ReturnInfo(),
                } = {}) {
        super();
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
                } = {}) {
        super();
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
    constructor({count = 25,
                 articlesSampleSize = 10000,
                 returnInfo = new ReturnInfo(),
                } = {}) {
        super();
        if (count > 50) {
            throw new RangeError("At most 50 concepts can be returned per call");
        }
        if (articlesSampleSize > 50000) {
            throw new RangeError("at most 50000 results can be used for computation sample");
        }
        this.params = {};
        this.params["conceptTrendsConceptCount"] = count;
        this.params["conceptTrendsSampleSize"] = articlesSampleSize;
        this.params = _.extend({}, this.params, returnInfo.getParams("conceptTrends"));
    }
}

export class RequestArticlesDateMentionAggr extends RequestArticles {
    public resultType = "dateMentionAggr";
}

export class RequestArticlesRecentActivity extends RequestArticles {
    public resultType = "recentActivity";
    public params;
    constructor({maxArticleCount = 60,
                 updatesAfterTm = undefined,
                 updatesAfterMinsAgo = undefined,
                 lang = undefined,
                 mandatorySourceLocation = false,
                 returnInfo = new ReturnInfo(),
                } = {}) {
        super();
        if (maxArticleCount > 1000) {
            throw new RangeError("At most 1000 articles can be returned per call");
        }
        if (!_.isUndefined(updatesAfterTm) && !_.isUndefined(updatesAfterMinsAgo)) {
            throw new Error("You should specify either updatesAfterTm or updatesAfterMinsAgo parameter, but not both");
        }
        this.params = {};
        this.params["recentActivityArticlesMaxArticleCount"] = maxArticleCount;
        if (!_.isUndefined(updatesAfterTm)) {
            this.params["recentActivityArticlesUpdatesAfterTm"] = QueryParamsBase.encodeDateTime(updatesAfterTm);
        }
        if (!_.isUndefined(updatesAfterMinsAgo)) {
            this.params["recentActivityEventsUpdatesAfterMinsAgo"] = updatesAfterMinsAgo;
        }
        if (!_.isUndefined(lang)) {
            this.params["recentActivityArticlesLang"] = lang;
        }
        this.params["recentActivityArticlesMandatorySourceLocation"] = mandatorySourceLocation;
        this.params = _.extend({}, this.params, returnInfo.getParams("recentActivityArticles"));
    }
}
