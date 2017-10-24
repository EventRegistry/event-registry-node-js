"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var base_1 = require("./base");
var returnInfo_1 = require("./returnInfo");
/**
 * @class QueryArticle
 * Class for obtaining available info for one or more articles in the Event Registry
 */
var QueryArticle = /** @class */ (function (_super) {
    __extends(QueryArticle, _super);
    /**
     * @param articleUriOrUriList a single article uri or a list of article uris
     * @param requestedResult the information to return as the result of the query. By default return the information about the article
     */
    function QueryArticle(articleUriOrUriList, requestedResult) {
        if (requestedResult === void 0) { requestedResult = new RequestArticleInfo(); }
        var _this = _super.call(this) || this;
        _this.setVal("action", "getArticle");
        _this.setVal("articleUri", articleUriOrUriList);
        _this.setRequestedResult(requestedResult);
        return _this;
    }
    Object.defineProperty(QueryArticle.prototype, "path", {
        get: function () {
            return "/json/article";
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Add a result type that you would like to be returned. In one QueryArticle you can ask for multiple result types.
     * Result types can be the classes that extend RequestArticle base class (see classes below).
     * @param requestArticle Determines what info should be returned as a result of the query
     */
    QueryArticle.prototype.addRequestedResult = function (requestArticle) {
        if (!(requestArticle instanceof RequestArticle)) {
            throw Error("QueryArticle class can only accept result requests that are of type RequestArticle");
        }
        this.resultTypeList = _.filter(this.resultTypeList, function (item) { return item["resultType"] !== requestArticle["resultType"]; }).concat([requestArticle]);
    };
    /**
     * Set the single result type that you would like to be returned.
     * If some other request type was previously set, it will be overwritten.
     * Result types can be the classes that extend RequestArticle base class (see classes below).
     */
    QueryArticle.prototype.setRequestedResult = function (requestArticle) {
        if (!(requestArticle instanceof RequestArticle)) {
            throw Error("QueryArticle class can only accept result requests that are of type RequestArticle");
        }
        this.resultTypeList = [requestArticle];
    };
    return QueryArticle;
}(base_1.Query));
exports.QueryArticle = QueryArticle;
var RequestArticle = /** @class */ (function () {
    function RequestArticle() {
    }
    return RequestArticle;
}());
exports.RequestArticle = RequestArticle;
/**
 * Return details about the article
 */
var RequestArticleInfo = /** @class */ (function (_super) {
    __extends(RequestArticleInfo, _super);
    /**
     * @param returnInfo what details should be included in the returned information
     */
    function RequestArticleInfo(returnInfo) {
        if (returnInfo === void 0) { returnInfo = new returnInfo_1.ReturnInfo({ articleInfo: new returnInfo_1.ArticleInfoFlags({ bodyLen: -1 }) }); }
        var _this = _super.call(this) || this;
        _this.resultType = "info";
        _this.params = returnInfo.getParams("info");
        return _this;
    }
    return RequestArticleInfo;
}(RequestArticle));
exports.RequestArticleInfo = RequestArticleInfo;
/**
 * Return a list of similar articles based on the CCA
 */
var RequestArticleSimilarArticles = /** @class */ (function (_super) {
    __extends(RequestArticleSimilarArticles, _super);
    function RequestArticleSimilarArticles(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        _this.resultType = "similarArticles";
        var _a = args.page, page = _a === void 0 ? 1 : _a, _b = args.count, count = _b === void 0 ? 20 : _b, _c = args.lang, lang = _c === void 0 ? ["eng"] : _c, _d = args.limitPerLang, limitPerLang = _d === void 0 ? -1 : _d, _e = args.returnInfo, returnInfo = _e === void 0 ? new returnInfo_1.ReturnInfo({ articleInfo: new returnInfo_1.ArticleInfoFlags({ bodyLen: -1 }) }) : _e;
        if (page < 1) {
            throw new RangeError("page has to be >= 1");
        }
        if (count > 200) {
            throw new RangeError("at most 200 articles can be returned per call");
        }
        _this.params = {};
        _this.params["similarArticlesPage"] = page;
        _this.params["similarArticlesCount"] = count;
        _this.params["similarArticlesLang"] = lang;
        _this.params["similarArticlesLimitPerLang"] = limitPerLang;
        _this.params = _.extend({}, _this.params, returnInfo.getParams("similarArticles"));
        return _this;
    }
    return RequestArticleSimilarArticles;
}(RequestArticle));
exports.RequestArticleSimilarArticles = RequestArticleSimilarArticles;
/**
 * return a list of duplicated articles of the current article
 */
var RequestArticleDuplicatedArticles = /** @class */ (function (_super) {
    __extends(RequestArticleDuplicatedArticles, _super);
    function RequestArticleDuplicatedArticles(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        _this.resultType = "duplicatedArticles";
        var _a = args.page, page = _a === void 0 ? 1 : _a, _b = args.count, count = _b === void 0 ? 20 : _b, _c = args.sortBy, sortBy = _c === void 0 ? "cosSim" : _c, _d = args.sortByAsc, sortByAsc = _d === void 0 ? false : _d, _e = args.returnInfo, returnInfo = _e === void 0 ? new returnInfo_1.ReturnInfo({ articleInfo: new returnInfo_1.ArticleInfoFlags({ bodyLen: -1 }) }) : _e;
        if (page < 1) {
            throw new RangeError("page has to be >= 1");
        }
        if (count > 200) {
            throw new RangeError("at most 200 articles can be returned per call");
        }
        _this.params = {};
        _this.params["duplicatedArticlesPage"] = page;
        _this.params["duplicatedArticlesCount"] = count;
        _this.params["duplicatedArticlesSortBy"] = sortBy;
        _this.params["duplicatedArticlesSortByAsc"] = sortByAsc;
        _this.params = _.extend({}, _this.params, returnInfo.getParams("duplicatedArticles"));
        return _this;
    }
    return RequestArticleDuplicatedArticles;
}(RequestArticle));
exports.RequestArticleDuplicatedArticles = RequestArticleDuplicatedArticles;
/**
 * return the article that is the original of the given article (the current article is a duplicate)
 */
var RequestArticleOriginalArticle = /** @class */ (function (_super) {
    __extends(RequestArticleOriginalArticle, _super);
    /**
     * @param returnInfo: what details should be included in the returned information
     */
    function RequestArticleOriginalArticle(returnInfo) {
        if (returnInfo === void 0) { returnInfo = new returnInfo_1.ReturnInfo({ articleInfo: new returnInfo_1.ArticleInfoFlags({ bodyLen: -1 }) }); }
        var _this = _super.call(this) || this;
        _this.resultType = "originalArticle";
        _this.params = returnInfo.getParams("originalArticle");
        return _this;
    }
    return RequestArticleOriginalArticle;
}(RequestArticle));
exports.RequestArticleOriginalArticle = RequestArticleOriginalArticle;
