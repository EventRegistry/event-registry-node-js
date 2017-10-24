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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var base_1 = require("./base");
var index_1 = require("./index");
var query_1 = require("./query");
var returnInfo_1 = require("./returnInfo");
var QueryArticles = /** @class */ (function (_super) {
    __extends(QueryArticles, _super);
    function QueryArticles(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        var keywords = args.keywords, conceptUri = args.conceptUri, categoryUri = args.categoryUri, sourceUri = args.sourceUri, sourceLocationUri = args.sourceLocationUri, sourceGroupUri = args.sourceGroupUri, locationUri = args.locationUri, lang = args.lang, dateStart = args.dateStart, dateEnd = args.dateEnd, dateMentionStart = args.dateMentionStart, dateMentionEnd = args.dateMentionEnd, ignoreKeywords = args.ignoreKeywords, ignoreConceptUri = args.ignoreConceptUri, ignoreCategoryUri = args.ignoreCategoryUri, ignoreSourceUri = args.ignoreSourceUri, ignoreSourceLocationUri = args.ignoreSourceLocationUri, ignoreSourceGroupUri = args.ignoreSourceGroupUri, ignoreLocationUri = args.ignoreLocationUri, ignoreLang = args.ignoreLang, _a = args.keywordsLoc, keywordsLoc = _a === void 0 ? "body" : _a, _b = args.ignoreKeywordsLoc, ignoreKeywordsLoc = _b === void 0 ? "body" : _b, _c = args.categoryIncludeSub, categoryIncludeSub = _c === void 0 ? true : _c, _d = args.ignoreCategoryIncludeSub, ignoreCategoryIncludeSub = _d === void 0 ? true : _d, _e = args.isDuplicateFilter, isDuplicateFilter = _e === void 0 ? "keepAll" : _e, _f = args.hasDuplicateFilter, hasDuplicateFilter = _f === void 0 ? "keepAll" : _f, _g = args.eventFilter, eventFilter = _g === void 0 ? "keepAll" : _g, _h = args.requestedResult, requestedResult = _h === void 0 ? new RequestArticlesInfo() : _h;
        _this.setVal("action", "getArticles");
        _this.setQueryArrVal(keywords, "keyword", "keywordOper", "and");
        _this.setQueryArrVal(conceptUri, "conceptUri", "conceptOper", "and");
        _this.setQueryArrVal(categoryUri, "categoryUri", "categoryOper", "or");
        _this.setQueryArrVal(sourceUri, "sourceUri", undefined, "or");
        _this.setQueryArrVal(sourceLocationUri, "sourceLocationUri", undefined, "or");
        _this.setQueryArrVal(sourceGroupUri, "sourceGroupUri", undefined, "or");
        _this.setQueryArrVal(locationUri, "locationUri", undefined, "or");
        _this.setQueryArrVal(lang, "lang", undefined, "or");
        if (!_.isUndefined(dateStart)) {
            _this.setDateVal("dateStart", dateStart);
        }
        if (!_.isUndefined(dateEnd)) {
            _this.setDateVal("dateEnd", dateEnd);
        }
        if (!_.isUndefined(dateMentionStart)) {
            _this.setDateVal("dateMentionStart", dateMentionStart);
        }
        if (!_.isUndefined(dateMentionEnd)) {
            _this.setDateVal("dateMentionEnd", dateMentionEnd);
        }
        _this.setQueryArrVal(ignoreKeywords, "ignoreKeyword", undefined, "or");
        _this.setQueryArrVal(ignoreConceptUri, "ignoreConceptUri", undefined, "or");
        _this.setQueryArrVal(ignoreCategoryUri, "ignoreCategoryUri", undefined, "or");
        _this.setQueryArrVal(ignoreSourceUri, "ignoreSourceUri", undefined, "or");
        _this.setQueryArrVal(ignoreSourceLocationUri, "ignoreSourceLocationUri", undefined, "or");
        _this.setQueryArrVal(ignoreSourceGroupUri, "ignoreSourceGroupUri", undefined, "or");
        _this.setQueryArrVal(ignoreLocationUri, "ignoreLocationUri", undefined, "or");
        _this.setQueryArrVal(ignoreLang, "ignoreLang", undefined, "or");
        _this.setValIfNotDefault("keywordLoc", keywordsLoc, "body");
        _this.setValIfNotDefault("ignoreKeywordLoc", ignoreKeywordsLoc, "body");
        _this.setValIfNotDefault("categoryIncludeSub", categoryIncludeSub, true);
        _this.setValIfNotDefault("ignoreCategoryIncludeSub", ignoreCategoryIncludeSub, true);
        _this.setValIfNotDefault("isDuplicateFilter", isDuplicateFilter, "keepAll");
        _this.setValIfNotDefault("hasDuplicateFilter", hasDuplicateFilter, "keepAll");
        _this.setValIfNotDefault("eventFilter", eventFilter, "keepAll");
        _this.addRequestedResult(requestedResult);
        return _this;
    }
    Object.defineProperty(QueryArticles.prototype, "path", {
        get: function () {
            return "/json/article";
        },
        enumerable: true,
        configurable: true
    });
    QueryArticles.prototype.addRequestedResult = function (requestArticles) {
        if (!(requestArticles instanceof RequestArticles)) {
            throw new Error("QueryArticles class can only accept result requests that are of type RequestArticles");
        }
        this.resultTypeList = _.filter(this.resultTypeList, function (item) { return item["resultType"] !== requestArticles["resultType"]; }).concat([requestArticles]);
    };
    QueryArticles.prototype.setRequestedResult = function (requestArticles) {
        if (!(requestArticles instanceof RequestArticles)) {
            throw new Error("QueryArticles class can only accept result requests that are of type RequestArticles");
        }
        this.resultTypeList = [requestArticles];
    };
    QueryArticles.initWithArticleUriList = function (uriList) {
        var q = new QueryArticles();
        if (!_.isArray(uriList)) {
            throw new Error("uriList has to be a list of strings that represent article uris");
        }
        q.setVal("action", "getArticles");
        q.setVal("articleUri", uriList);
        return q;
    };
    QueryArticles.initWithComplexQuery = function (query, complexQuery) {
        if (complexQuery instanceof query_1.ComplexArticleQuery) {
            query.setVal("query", JSON.stringify(complexQuery.getQuery()));
        }
        else if (_.isString(complexQuery)) {
            query.setVal("query", complexQuery);
        }
        else if (_.isObject(complexQuery)) {
            query.setVal("query", JSON.stringify(complexQuery));
        }
        else {
            throw new Error("The instance of query parameter was not a ComplexArticleQuery, a string or an object");
        }
        return query;
    };
    return QueryArticles;
}(base_1.Query));
exports.QueryArticles = QueryArticles;
var QueryArticlesIter = /** @class */ (function (_super) {
    __extends(QueryArticlesIter, _super);
    function QueryArticlesIter(er, args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this, args) || this;
        _this.uriPage = 0;
        _this.returnedDataSize = 0;
        _this.uriWgtList = [];
        _.defaults(args, {
            sortBy: "rel",
            sortByAsc: false,
            returnInfo: new returnInfo_1.ReturnInfo(),
            articleBatchSize: 200,
            maxItems: -1,
        });
        var sortBy = args.sortBy, sortByAsc = args.sortByAsc, returnInfo = args.returnInfo, articleBatchSize = args.articleBatchSize, maxItems = args.maxItems;
        if (articleBatchSize > 200) {
            throw new Error("You can not have a batch size > 200 items");
        }
        _this.er = er;
        _this.sortBy = sortBy;
        _this.sortByAsc = sortByAsc;
        _this.returnInfo = returnInfo;
        _this.articleBatchSize = articleBatchSize;
        _this.maxItems = maxItems;
        return _this;
    }
    QueryArticlesIter.prototype.execQuery = function (callback, doneCallback) {
        this.getNextBatch(callback, doneCallback);
    };
    QueryArticlesIter.initWithComplexQuery = function (query, complexQuery) {
        if (complexQuery instanceof query_1.ComplexArticleQuery) {
            query.setVal("query", JSON.stringify(complexQuery.getQuery()));
        }
        else if (_.isString(complexQuery)) {
            query.setVal("query", complexQuery);
        }
        else if (_.isObject(complexQuery)) {
            query.setVal("query", JSON.stringify(complexQuery));
        }
        else {
            throw new Error("The instance of query parameter was not a ComplexArticleQuery, a string or an object");
        }
        return query;
    };
    QueryArticlesIter.prototype.getNextUriPage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var requestArticlesUriWgtList, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.uriPage++;
                        this.uriWgtList = [];
                        if (!this.allUriPages && this.uriPage > this.allUriPages) {
                            return [2 /*return*/];
                        }
                        requestArticlesUriWgtList = new RequestArticlesUriWgtList({ page: this.uriPage, sortBy: this.sortBy, sortByAsc: this.sortByAsc });
                        this.setRequestedResult(requestArticlesUriWgtList);
                        return [4 /*yield*/, this.er.execQuery(this)];
                    case 1:
                        res = _a.sent();
                        this.uriWgtList = _.get(res, "uriWgtList.results", []);
                        this.allUriPages = _.get(res, "uriWgtList.pages", 0);
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(QueryArticlesIter.prototype, "batchSize", {
        get: function () {
            if (this.maxItems === -1) {
                return this.articleBatchSize;
            }
            var toReturnSize = this.maxItems - this.returnedDataSize;
            return toReturnSize < this.articleBatchSize ? toReturnSize : this.articleBatchSize;
        },
        enumerable: true,
        configurable: true
    });
    QueryArticlesIter.prototype.getNextBatch = function (callback, doneCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var uriWgts, uris, q, requestArticlesInfo, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.clearRequestedResults();
                        if (!_.isEmpty(this.uriWgtList)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getNextUriPage()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (_.isEmpty(this.uriWgtList) || (this.maxItems !== -1 && this.maxItems === this.returnedDataSize)) {
                            if (doneCallback) {
                                doneCallback();
                            }
                            return [2 /*return*/];
                        }
                        uriWgts = _.take(this.uriWgtList, this.batchSize);
                        uris = _.map(uriWgts, function (uriWgt) { return _.first(_.split(uriWgt, ":")); });
                        this.uriWgtList = _.drop(this.uriWgtList, this.batchSize);
                        q = QueryArticles.initWithArticleUriList(uris);
                        requestArticlesInfo = new RequestArticlesInfo({ count: this.batchSize, sortBy: "none", returnInfo: this.returnInfo });
                        q.setRequestedResult(requestArticlesInfo);
                        return [4 /*yield*/, this.er.execQuery(q)];
                    case 3:
                        res = _a.sent();
                        this.returnedDataSize += _.size(uris);
                        callback(_.get(res, "articles.results"), _.get(res, "error"));
                        if (this.uriPage <= this.allUriPages) {
                            this.getNextBatch(callback, doneCallback);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return QueryArticlesIter;
}(QueryArticles));
exports.QueryArticlesIter = QueryArticlesIter;
var RequestArticles = /** @class */ (function () {
    function RequestArticles() {
    }
    return RequestArticles;
}());
exports.RequestArticles = RequestArticles;
var RequestArticlesInfo = /** @class */ (function (_super) {
    __extends(RequestArticlesInfo, _super);
    function RequestArticlesInfo(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.page, page = _c === void 0 ? 1 : _c, _d = _b.count, count = _d === void 0 ? 20 : _d, _e = _b.sortBy, sortBy = _e === void 0 ? "date" : _e, _f = _b.sortByAsc, sortByAsc = _f === void 0 ? false : _f, _g = _b.returnInfo, returnInfo = _g === void 0 ? new returnInfo_1.ReturnInfo() : _g;
        var _this = _super.call(this) || this;
        _this.resultType = "articles";
        if (page < 1) {
            throw new RangeError("page has to be >= 1");
        }
        if (count > 200) {
            throw new RangeError("at most 200 articles can be returned per call");
        }
        _this.params = {};
        _this.params["articlesPage"] = page;
        _this.params["articlesCount"] = count;
        _this.params["articlesSortBy"] = sortBy;
        _this.params["articlesSortByAsc"] = sortByAsc;
        _this.params = _.extend({}, _this.params, returnInfo.getParams("articles"));
        return _this;
    }
    return RequestArticlesInfo;
}(RequestArticles));
exports.RequestArticlesInfo = RequestArticlesInfo;
var RequestArticlesUriList = /** @class */ (function (_super) {
    __extends(RequestArticlesUriList, _super);
    function RequestArticlesUriList(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.page, page = _c === void 0 ? 1 : _c, _d = _b.count, count = _d === void 0 ? 10000 : _d, _e = _b.sortBy, sortBy = _e === void 0 ? "fq" : _e, _f = _b.sortByAsc, sortByAsc = _f === void 0 ? false : _f;
        var _this = _super.call(this) || this;
        _this.resultType = "uriList";
        if (page < 1) {
            throw new RangeError("page has to be >= 1");
        }
        if (count > 50000) {
            throw new RangeError("at most 50000 items can be returned per call");
        }
        _this.params = {};
        _this.params["uriListPage"] = page;
        _this.params["uriListCount"] = count;
        _this.params["uriListSortBy"] = sortBy;
        _this.params["uriListSortByAsc"] = sortByAsc;
        return _this;
    }
    RequestArticlesUriList.prototype.setPage = function (page) {
        if (page < 1) {
            throw new RangeError("page has to be >= 1");
        }
        this.params["uriListPage"] = page;
    };
    return RequestArticlesUriList;
}(RequestArticles));
exports.RequestArticlesUriList = RequestArticlesUriList;
var RequestArticlesUriWgtList = /** @class */ (function (_super) {
    __extends(RequestArticlesUriWgtList, _super);
    function RequestArticlesUriWgtList(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.page, page = _c === void 0 ? 1 : _c, _d = _b.count, count = _d === void 0 ? 10000 : _d, _e = _b.sortBy, sortBy = _e === void 0 ? "fq" : _e, _f = _b.sortByAsc, sortByAsc = _f === void 0 ? false : _f;
        var _this = _super.call(this) || this;
        _this.resultType = "uriWgtList";
        if (page < 1) {
            throw new RangeError("page has to be >= 1");
        }
        if (count > 50000) {
            throw new RangeError("at most 50000 items can be returned per call");
        }
        _this.params = {};
        _this.params["uriWgtListPage"] = page;
        _this.params["uriListCount"] = count;
        _this.params["uriListSortBy"] = sortBy;
        _this.params["uriListSortByAsc"] = sortByAsc;
        return _this;
    }
    RequestArticlesUriWgtList.prototype.setPage = function (page) {
        if (page < 1) {
            throw new RangeError("page has to be >= 1");
        }
        this.params["uriWgtListPage"] = page;
    };
    return RequestArticlesUriWgtList;
}(RequestArticles));
exports.RequestArticlesUriWgtList = RequestArticlesUriWgtList;
var RequestArticlesTimeAggr = /** @class */ (function (_super) {
    __extends(RequestArticlesTimeAggr, _super);
    function RequestArticlesTimeAggr() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.resultType = "timeAggr";
        return _this;
    }
    return RequestArticlesTimeAggr;
}(RequestArticles));
exports.RequestArticlesTimeAggr = RequestArticlesTimeAggr;
var RequestArticlesConceptAggr = /** @class */ (function (_super) {
    __extends(RequestArticlesConceptAggr, _super);
    function RequestArticlesConceptAggr(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.conceptCount, conceptCount = _c === void 0 ? 25 : _c, _d = _b.articlesSampleSize, articlesSampleSize = _d === void 0 ? 10000 : _d, _e = _b.returnInfo, returnInfo = _e === void 0 ? new returnInfo_1.ReturnInfo() : _e;
        var _this = _super.call(this) || this;
        _this.resultType = "conceptAggr";
        if (conceptCount > 500) {
            throw new RangeError("At most 500 concepts can be returned per call");
        }
        if (articlesSampleSize > 20000) {
            throw new RangeError("at most 20000 articles can be used for computation sample");
        }
        _this.params = {};
        _this.params["conceptAggrConceptCount"] = conceptCount;
        _this.params["conceptAggrSampleSize"] = articlesSampleSize;
        _this.params = _.extend({}, _this.params, returnInfo.getParams("conceptAggr"));
        return _this;
    }
    return RequestArticlesConceptAggr;
}(RequestArticles));
exports.RequestArticlesConceptAggr = RequestArticlesConceptAggr;
var RequestArticlesCategoryAggr = /** @class */ (function (_super) {
    __extends(RequestArticlesCategoryAggr, _super);
    function RequestArticlesCategoryAggr(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.articlesSampleSize, articlesSampleSize = _c === void 0 ? 20000 : _c, _d = _b.returnInfo, returnInfo = _d === void 0 ? new returnInfo_1.ReturnInfo() : _d;
        var _this = _super.call(this) || this;
        _this.resultType = "categoryAggr";
        if (articlesSampleSize > 50000) {
            throw new RangeError("at most 50000 articles can be used for computation sample");
        }
        _this.params = {};
        _this.params["categoryAggrSampleSize"] = articlesSampleSize;
        _this.params = _.extend({}, _this.params, returnInfo.getParams("categoryAggr"));
        return _this;
    }
    return RequestArticlesCategoryAggr;
}(RequestArticles));
exports.RequestArticlesCategoryAggr = RequestArticlesCategoryAggr;
var RequestArticlesSourceAggr = /** @class */ (function (_super) {
    __extends(RequestArticlesSourceAggr, _super);
    function RequestArticlesSourceAggr(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.articlesSampleSize, articlesSampleSize = _c === void 0 ? 20000 : _c, _d = _b.returnInfo, returnInfo = _d === void 0 ? new returnInfo_1.ReturnInfo() : _d;
        var _this = _super.call(this) || this;
        _this.resultType = "sourceAggr";
        if (articlesSampleSize > 1000000) {
            throw new RangeError("at most 1000000 articles can be used for computation sample");
        }
        _this.params = {};
        _this.params["sourceAggrSampleSize"] = articlesSampleSize;
        _this.params = _.extend({}, _this.params, returnInfo.getParams("sourceAggr"));
        return _this;
    }
    return RequestArticlesSourceAggr;
}(RequestArticles));
exports.RequestArticlesSourceAggr = RequestArticlesSourceAggr;
var RequestArticlesKeywordAggr = /** @class */ (function (_super) {
    __extends(RequestArticlesKeywordAggr, _super);
    function RequestArticlesKeywordAggr(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.lang, lang = _c === void 0 ? "eng" : _c, _d = _b.articlesSampleSize, articlesSampleSize = _d === void 0 ? 10000 : _d;
        var _this = _super.call(this) || this;
        _this.resultType = "keywordAggr";
        if (articlesSampleSize > 50000) {
            throw new RangeError("at most 50000 articles can be used for computation sample");
        }
        _this.params = {};
        _this.params["keywordAggrLang"] = lang;
        _this.params["keywordAggrSampleSize"] = articlesSampleSize;
        return _this;
    }
    return RequestArticlesKeywordAggr;
}(RequestArticles));
exports.RequestArticlesKeywordAggr = RequestArticlesKeywordAggr;
var RequestArticlesConceptGraph = /** @class */ (function (_super) {
    __extends(RequestArticlesConceptGraph, _super);
    function RequestArticlesConceptGraph(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.conceptCount, conceptCount = _c === void 0 ? 25 : _c, _d = _b.linkCount, linkCount = _d === void 0 ? 50 : _d, _e = _b.articlesSampleSize, articlesSampleSize = _e === void 0 ? 10000 : _e, _f = _b.returnInfo, returnInfo = _f === void 0 ? new returnInfo_1.ReturnInfo() : _f;
        var _this = _super.call(this) || this;
        _this.resultType = "conceptGraph";
        if (conceptCount > 1000) {
            throw new RangeError("At most 1000 concepts can be returned per call");
        }
        if (linkCount > 2000) {
            throw new RangeError("at most 2000 links can be returned per call");
        }
        if (articlesSampleSize > 50000) {
            throw new RangeError("at most 50000 results can be used for computation sample");
        }
        _this.params = {};
        _this.params["conceptGraphConceptCount"] = conceptCount;
        _this.params["conceptGraphLinkCount"] = linkCount;
        _this.params["conceptGraphSampleSize"] = articlesSampleSize;
        _this.params = _.extend({}, _this.params, returnInfo.getParams("conceptGraph"));
        return _this;
    }
    return RequestArticlesConceptGraph;
}(RequestArticles));
exports.RequestArticlesConceptGraph = RequestArticlesConceptGraph;
var RequestArticlesConceptMatrix = /** @class */ (function (_super) {
    __extends(RequestArticlesConceptMatrix, _super);
    function RequestArticlesConceptMatrix(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.conceptCount, conceptCount = _c === void 0 ? 25 : _c, _d = _b.measure, measure = _d === void 0 ? "pmi" : _d, _e = _b.articlesSampleSize, articlesSampleSize = _e === void 0 ? 10000 : _e, _f = _b.returnInfo, returnInfo = _f === void 0 ? new returnInfo_1.ReturnInfo() : _f;
        var _this = _super.call(this) || this;
        _this.resultType = "conceptMatrix";
        if (conceptCount > 200) {
            throw new RangeError("At most 200 concepts can be returned per call");
        }
        if (articlesSampleSize > 50000) {
            throw new RangeError("at most 50000 results can be used for computation sample");
        }
        _this.params = {};
        _this.params["conceptMatrixConceptCount"] = conceptCount;
        _this.params["conceptMatrixMeasure"] = measure;
        _this.params["conceptMatrixSampleSize"] = articlesSampleSize;
        _this.params = _.extend({}, _this.params, returnInfo.getParams("conceptMatrix"));
        return _this;
    }
    return RequestArticlesConceptMatrix;
}(RequestArticles));
exports.RequestArticlesConceptMatrix = RequestArticlesConceptMatrix;
var RequestArticlesConceptTrends = /** @class */ (function (_super) {
    __extends(RequestArticlesConceptTrends, _super);
    function RequestArticlesConceptTrends(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.count, count = _c === void 0 ? 25 : _c, _d = _b.articlesSampleSize, articlesSampleSize = _d === void 0 ? 10000 : _d, _e = _b.returnInfo, returnInfo = _e === void 0 ? new returnInfo_1.ReturnInfo() : _e;
        var _this = _super.call(this) || this;
        _this.resultType = "conceptTrends";
        if (count > 50) {
            throw new RangeError("At most 50 concepts can be returned per call");
        }
        if (articlesSampleSize > 50000) {
            throw new RangeError("at most 50000 results can be used for computation sample");
        }
        _this.params = {};
        _this.params["conceptTrendsConceptCount"] = count;
        _this.params["conceptTrendsSampleSize"] = articlesSampleSize;
        _this.params = _.extend({}, _this.params, returnInfo.getParams("conceptTrends"));
        return _this;
    }
    return RequestArticlesConceptTrends;
}(RequestArticles));
exports.RequestArticlesConceptTrends = RequestArticlesConceptTrends;
var RequestArticlesDateMentionAggr = /** @class */ (function (_super) {
    __extends(RequestArticlesDateMentionAggr, _super);
    function RequestArticlesDateMentionAggr() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.resultType = "dateMentionAggr";
        return _this;
    }
    return RequestArticlesDateMentionAggr;
}(RequestArticles));
exports.RequestArticlesDateMentionAggr = RequestArticlesDateMentionAggr;
var RequestArticlesRecentActivity = /** @class */ (function (_super) {
    __extends(RequestArticlesRecentActivity, _super);
    function RequestArticlesRecentActivity(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.maxArticleCount, maxArticleCount = _c === void 0 ? 60 : _c, _d = _b.updatesAfterTm, updatesAfterTm = _d === void 0 ? undefined : _d, _e = _b.updatesAfterMinsAgo, updatesAfterMinsAgo = _e === void 0 ? undefined : _e, _f = _b.lang, lang = _f === void 0 ? undefined : _f, _g = _b.mandatorySourceLocation, mandatorySourceLocation = _g === void 0 ? false : _g, _h = _b.returnInfo, returnInfo = _h === void 0 ? new returnInfo_1.ReturnInfo() : _h;
        var _this = _super.call(this) || this;
        _this.resultType = "recentActivity";
        if (maxArticleCount > 1000) {
            throw new RangeError("At most 1000 articles can be returned per call");
        }
        if (!_.isUndefined(updatesAfterTm) && !_.isUndefined(updatesAfterMinsAgo)) {
            throw new Error("You should specify either updatesAfterTm or updatesAfterMinsAgo parameter, but not both");
        }
        _this.params = {};
        _this.params["recentActivityArticlesMaxArticleCount"] = maxArticleCount;
        if (!_.isUndefined(updatesAfterTm)) {
            _this.params["recentActivityArticlesUpdatesAfterTm"] = index_1.QueryParamsBase.encodeDateTime(updatesAfterTm);
        }
        if (!_.isUndefined(updatesAfterMinsAgo)) {
            _this.params["recentActivityEventsUpdatesAfterMinsAgo"] = updatesAfterMinsAgo;
        }
        if (!_.isUndefined(lang)) {
            _this.params["recentActivityArticlesLang"] = lang;
        }
        _this.params["recentActivityArticlesMandatorySourceLocation"] = mandatorySourceLocation;
        _this.params = _.extend({}, _this.params, returnInfo.getParams("recentActivityArticles"));
        return _this;
    }
    return RequestArticlesRecentActivity;
}(RequestArticles));
exports.RequestArticlesRecentActivity = RequestArticlesRecentActivity;
