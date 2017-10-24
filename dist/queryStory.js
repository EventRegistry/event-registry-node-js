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
var index_1 = require("./index");
var QueryStory = /** @class */ (function (_super) {
    __extends(QueryStory, _super);
    function QueryStory(storyUriOrList) {
        var _this = _super.call(this) || this;
        _this.setVal("action", "getStory");
        _this.queryByUri(storyUriOrList);
        return _this;
    }
    Object.defineProperty(QueryStory.prototype, "path", {
        get: function () {
            return "/json/story";
        },
        enumerable: true,
        configurable: true
    });
    QueryStory.prototype.queryByUri = function (uriOrUriList) {
        this.setVal("storyUri", uriOrUriList);
    };
    QueryStory.prototype.addRequestedResult = function (requestStory) {
        if (!(requestStory instanceof RequestStory)) {
            throw Error("QueryStory class can only accept result requests that are of type RequestStory");
        }
        this.resultTypeList = _.filter(this.resultTypeList, function (item) { return item["resultType"] !== requestStory["resultType"]; }).concat([requestStory]);
    };
    QueryStory.prototype.setRequestedResult = function (requestStory) {
        if (!(requestStory instanceof RequestStory)) {
            throw Error("QueryStory class can only accept result requests that are of type RequestStory");
        }
        this.resultTypeList = [requestStory];
    };
    return QueryStory;
}(index_1.Query));
exports.QueryStory = QueryStory;
var RequestStory = /** @class */ (function () {
    function RequestStory() {
    }
    return RequestStory;
}());
exports.RequestStory = RequestStory;
var RequestStoryInfo = /** @class */ (function (_super) {
    __extends(RequestStoryInfo, _super);
    function RequestStoryInfo(returnInfo) {
        if (returnInfo === void 0) { returnInfo = new index_1.ReturnInfo(); }
        var _this = _super.call(this) || this;
        _this.resultType = "info";
        _this.params = returnInfo.getParams("info");
        return _this;
    }
    return RequestStoryInfo;
}(RequestStory));
exports.RequestStoryInfo = RequestStoryInfo;
var RequestStoryArticles = /** @class */ (function (_super) {
    __extends(RequestStoryArticles, _super);
    function RequestStoryArticles(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.page, page = _c === void 0 ? 1 : _c, _d = _b.count, count = _d === void 0 ? 20 : _d, _e = _b.sortBy, sortBy = _e === void 0 ? "cosSim" : _e, _f = _b.sortByAsc, sortByAsc = _f === void 0 ? false : _f, _g = _b.returnInfo, returnInfo = _g === void 0 ? new index_1.ReturnInfo({ articleInfo: new index_1.ArticleInfoFlags({ bodyLen: 200 }) }) : _g;
        var _this = _super.call(this) || this;
        _this.resultType = "articles";
        if (page < 1) {
            throw new RangeError("Page has to be >= 1");
        }
        if (count > 200) {
            throw new RangeError("At most 200 articles can be returned per call");
        }
        _this.params = {};
        _this.params["articlesPage"] = page;
        _this.params["articlesCount"] = count;
        _this.params["articlesSortBy"] = sortBy;
        _this.params["articlesSortByAsc"] = sortByAsc;
        _this.params = _.extend({}, _this.params, returnInfo.getParams("articles"));
        return _this;
    }
    return RequestStoryArticles;
}(RequestStory));
exports.RequestStoryArticles = RequestStoryArticles;
var RequestStoryArticleUris = /** @class */ (function (_super) {
    __extends(RequestStoryArticleUris, _super);
    function RequestStoryArticleUris(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.sortBy, sortBy = _c === void 0 ? "cosSim" : _c, _d = _b.sortByAsc, sortByAsc = _d === void 0 ? false : _d;
        var _this = _super.call(this) || this;
        _this.resultType = "articleUris";
        _this.params = {};
        _this.params["articleUrisSortBy"] = sortBy;
        _this.params["articleUrisSortByAsc"] = sortByAsc;
        return _this;
    }
    return RequestStoryArticleUris;
}(RequestStory));
exports.RequestStoryArticleUris = RequestStoryArticleUris;
var RequestStoryArticleTrend = /** @class */ (function (_super) {
    __extends(RequestStoryArticleTrend, _super);
    function RequestStoryArticleTrend(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.lang, lang = _c === void 0 ? index_1.mainLangs : _c, _d = _b.minArticleCosSim, minArticleCosSim = _d === void 0 ? -1 : _d, _e = _b.returnInfo, returnInfo = _e === void 0 ? new index_1.ReturnInfo({ articleInfo: new index_1.ArticleInfoFlags({ bodyLen: 0 }) }) : _e;
        var _this = _super.call(this) || this;
        _this.resultType = "articleTrend";
        _this.params = {};
        _this.params["articleTrendLang"] = lang;
        _this.params["articleTrendMinArticleCosSim"] = minArticleCosSim;
        _this.params = _.extend({}, _this.params, returnInfo.getParams("articles"));
        return _this;
    }
    return RequestStoryArticleTrend;
}(RequestStory));
exports.RequestStoryArticleTrend = RequestStoryArticleTrend;
var RequestStorySimilarStories = /** @class */ (function (_super) {
    __extends(RequestStorySimilarStories, _super);
    function RequestStorySimilarStories(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.count, count = _c === void 0 ? 20 : _c, _d = _b.source, source = _d === void 0 ? "concept" : _d, _e = _b.maxDayDiff, maxDayDiff = _e === void 0 ? Number.MAX_SAFE_INTEGER : _e, _f = _b.addArticleTrendInfo, addArticleTrendInfo = _f === void 0 ? false : _f, _g = _b.returnInfo, returnInfo = _g === void 0 ? new index_1.ReturnInfo({ articleInfo: new index_1.ArticleInfoFlags({ bodyLen: 0 }) }) : _g;
        var _this = _super.call(this) || this;
        _this.resultType = "similarStories";
        _this.params = {};
        _this.params["similarEventsCount"] = count;
        _this.params["similarEventsSource"] = source;
        if (maxDayDiff !== Number.MAX_SAFE_INTEGER) {
            _this.params["similarEventsMaxDayDiff"] = maxDayDiff;
        }
        _this.params["similarEventsAddArticleTrendInfo"] = addArticleTrendInfo;
        _this.params = _.extend({}, _this.params, returnInfo.getParams("similarEvents"));
        return _this;
    }
    return RequestStorySimilarStories;
}(RequestStory));
exports.RequestStorySimilarStories = RequestStorySimilarStories;
