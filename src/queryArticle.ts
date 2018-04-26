import * as _ from "lodash";
import { mainLangs, Query } from "./base";
import { EventRegistry } from "./eventRegistry";
import { ArticleInfoFlags, ReturnInfo } from "./returnInfo";
import { ER } from "./types";

/**
 * @class QueryArticle
 * Class for obtaining available info for one or more articles in the Event Registry
 */
export class QueryArticle extends Query<RequestArticle> {
    /**
     * @param articleUriOrUriList a single article uri or a list of article uris
     * @param requestedResult the information to return as the result of the query. By default return the information about the article
     */
    constructor(articleUriOrUriList: string | string[], requestedResult = new RequestArticleInfo()) {
        super();
        this.setVal("action", "getArticle");
        this.setVal("articleUri", articleUriOrUriList);
        this.setRequestedResult(requestedResult);
    }

    public get path() {
        return "/json/article";
    }

    /**
     * Set the single result type that you would like to be returned.
     * If some other request type was previously set, it will be overwritten.
     * Result types can be the classes that extend RequestArticle base class (see classes below).
     */
    public setRequestedResult(requestArticle) {
        if (!(requestArticle instanceof RequestArticle)) {
            throw Error("QueryArticle class can only accept result requests that are of type RequestArticle");
        }
        this.resultTypeList = [requestArticle];
    }

}

export class RequestArticle {}

/**
 * Return details about the article
 */
export class RequestArticleInfo extends RequestArticle {
    public resultType = "info";
    public params;

    /**
     * @param returnInfo what details should be included in the returned information
     */
    constructor(returnInfo = new ReturnInfo({articleInfo: new ArticleInfoFlags({ bodyLen: -1})})) {
        super();
        this.params = returnInfo.getParams("info");
    }
}

/**
 * Return a list of similar articles based on the CCA
 */
export class RequestArticleSimilarArticles extends RequestArticle {
    public resultType = "similarArticles";
    public params;
    constructor(args: ER.QueryArticle.RequestArticleSimilarArticlesArguments = {}) {
        super();
        const {
            page = 1,
            count = 20,
            lang = ["eng"],
            limitPerLang = -1,
            returnInfo = new ReturnInfo({ articleInfo: new ArticleInfoFlags({ bodyLen: -1 })}),
        } = args;
        if (page < 1) {
            throw new RangeError("page has to be >= 1");
        }
        if (count > 200) {
            throw new RangeError("at most 200 articles can be returned per call");
        }
        this.params = {};
        this.params["similarArticlesPage"] = page;
        this.params["similarArticlesCount"] = count;
        this.params["similarArticlesLang"] = lang;
        this.params["similarArticlesLimitPerLang"] = limitPerLang;
        this.params = _.extend({}, this.params, returnInfo.getParams("similarArticles"));
    }
}

/**
 * return a list of duplicated articles of the current article
 */
export class RequestArticleDuplicatedArticles extends RequestArticle {
    public resultType = "duplicatedArticles";
    public params;
    constructor(args: ER.QueryArticle.RequestArticleDuplicatedArticlesArguments = {}) {
        super();
        const {
            page = 1,
            count = 20,
            sortBy = "cosSim",
            sortByAsc = false,
            returnInfo = new ReturnInfo({ articleInfo: new ArticleInfoFlags({ bodyLen: -1 })}),
        } = args;
        if (page < 1) {
            throw new RangeError("page has to be >= 1");
        }
        if (count > 200) {
            throw new RangeError("at most 200 articles can be returned per call");
        }
        this.params = {};
        this.params["duplicatedArticlesPage"] = page;
        this.params["duplicatedArticlesCount"] = count;
        this.params["duplicatedArticlesSortBy"] = sortBy;
        this.params["duplicatedArticlesSortByAsc"] = sortByAsc;
        this.params = _.extend({}, this.params, returnInfo.getParams("duplicatedArticles"));
    }
}

/**
 * return the article that is the original of the given article (the current article is a duplicate)
 */
export class RequestArticleOriginalArticle extends RequestArticle {
    public resultType = "originalArticle";
    public params;
    /**
     * @param returnInfo: what details should be included in the returned information
     */
    constructor(returnInfo = new ReturnInfo({articleInfo: new ArticleInfoFlags({bodyLen: -1})})) {
        super();
        this.params = returnInfo.getParams("originalArticle");
    }
}
