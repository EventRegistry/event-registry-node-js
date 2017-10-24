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
var queryArticle_1 = require("./queryArticle");
var returnInfo_1 = require("./returnInfo");
/**
 * @class QueryEvent
 * Class for obtaining available info for one or more events in the Event Registry
 */
var QueryEvent = /** @class */ (function (_super) {
    __extends(QueryEvent, _super);
    /**
     * @param eventUriOrList A single event uri or a list of event uris
     * @param requestedResult The information to return as the result of the query. By default return the details of the event
     */
    function QueryEvent(eventUriOrList, requestedResult) {
        if (requestedResult === void 0) { requestedResult = new RequestEventInfo(); }
        var _this = _super.call(this) || this;
        _this.setVal("action", "getEvent");
        _this.setVal("eventUri", eventUriOrList);
        _this.setRequestedResult(requestedResult);
        return _this;
    }
    Object.defineProperty(QueryEvent.prototype, "path", {
        get: function () {
            return "/json/event";
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Add a result type that you would like to be returned.
     * In case you are a subscribed customer you can ask for multiple result types in a single query
     * (for free users, only a single result type can be required per call).
     * Result types can be the classes that extend RequestEvent base class (see classes below).
     */
    QueryEvent.prototype.addRequestedResult = function (requestEvent) {
        if (!(requestEvent instanceof RequestEvent)) {
            throw Error("QueryEvent class can only accept result requests that are of type RequestEvent");
        }
        this.resultTypeList = _.filter(this.resultTypeList, function (item) { return item["resultType"] !== requestEvent["resultType"]; }).concat([requestEvent]);
    };
    /**
     * Set the single result type that you would like to be returned. Any previously set result types will be overwritten.
     * Result types can be the classes that extend RequestEvent base class (see classes below).
     */
    QueryEvent.prototype.setRequestedResult = function (requestEvent) {
        if (!(requestEvent instanceof RequestEvent)) {
            throw Error("QueryEvent class can only accept result requests that are of type RequestEvent");
        }
        this.resultTypeList = [requestEvent];
    };
    return QueryEvent;
}(base_1.Query));
exports.QueryEvent = QueryEvent;
/**
 * @class QueryEventArticlesIter
 * Class for iterating through all the articles in the event via callbacks
 */
var QueryEventArticlesIter = /** @class */ (function (_super) {
    __extends(QueryEventArticlesIter, _super);
    /**
     * @param er instance of EventRegistry class. used to obtain the necessary data
     * @param eventUri a single event for which we want to obtain the list of articles in it
     * @param args Object which contains a host of optional parameters
     */
    function QueryEventArticlesIter(er, eventUri, args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this, eventUri) || this;
        _this.returnedDataSize = 0;
        var _a = args.lang, lang = _a === void 0 ? base_1.mainLangs : _a, _b = args.sortBy, sortBy = _b === void 0 ? "cosSim" : _b, _c = args.sortByAsc, sortByAsc = _c === void 0 ? false : _c, _d = args.returnInfo, returnInfo = _d === void 0 ? new returnInfo_1.ReturnInfo({ articleInfo: new returnInfo_1.ArticleInfoFlags({ bodyLen: 200 }) }) : _d, _e = args.articleBatchSize, articleBatchSize = _e === void 0 ? 200 : _e, _f = args.maxItems, maxItems = _f === void 0 ? -1 : _f;
        if (articleBatchSize > 200) {
            throw new Error("You can not have a batch size > 200 items");
        }
        _this.er = er;
        _this.lang = lang;
        _this.sortBy = sortBy;
        _this.sortByAsc = sortByAsc;
        _this.returnInfo = returnInfo;
        _this.articleBatchSize = articleBatchSize;
        _this.maxItems = maxItems;
        _this.eventUri = eventUri;
        return _this;
    }
    /**
     * Execute query and fetch batches of articles of the specified size (articleBatchSize)
     * @param callback callback function that'll be called every time we get a new batch of articles from the backend
     * @param doneCallback callback function that'll be called when everything is complete
     */
    QueryEventArticlesIter.prototype.execQuery = function (callback, doneCallback) {
        var _this = this;
        this.initialDataFetch().then(function (uriList) {
            if (!_.isEmpty(uriList)) {
                _this.getNextBatch(uriList, callback, doneCallback);
            }
        });
    };
    QueryEventArticlesIter.prototype.initialDataFetch = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setRequestedResult(new RequestEventArticleUris({ lang: this.lang, sortBy: this.sortBy, sortByAsc: this.sortByAsc }));
                        return [4 /*yield*/, this.er.execQuery(this)];
                    case 1:
                        res = _a.sent();
                        if (_.has(res, "error")) {
                            console.error(_.get(res, "error"));
                        }
                        return [2 /*return*/, _.get(res[this.eventUri], "articleUris.results", [])];
                }
            });
        });
    };
    Object.defineProperty(QueryEventArticlesIter.prototype, "batchSize", {
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
    QueryEventArticlesIter.prototype.getNextBatch = function (uriList, callback, doneCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var uris, query, res_1, errorMessage, data, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.clearRequestedResults();
                        uris = _.compact(_.pullAt(uriList, [0, this.batchSize]));
                        query = new queryArticle_1.QueryArticle(uris);
                        query.setRequestedResult(new queryArticle_1.RequestArticleInfo(this.returnInfo));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, this.er.execQuery(query)];
                    case 2:
                        res_1 = _a.sent();
                        errorMessage = _.get(res_1, "error");
                        this.returnedDataSize += _.size(uris);
                        data = _.map(uris, function (uri) { return res_1[uri + ""].info; });
                        return [4 /*yield*/, callback(data, errorMessage)];
                    case 3:
                        _a.sent();
                        if (!(_.isEmpty(uriList) || (this.maxItems !== -1 && this.maxItems === this.returnedDataSize))) return [3 /*break*/, 4];
                        if (doneCallback) {
                            doneCallback(errorMessage);
                        }
                        return [2 /*return*/];
                    case 4: return [4 /*yield*/, this.getNextBatch(uriList, callback, doneCallback)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_1 = _a.sent();
                        console.error(error_1);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    return QueryEventArticlesIter;
}(QueryEvent));
exports.QueryEventArticlesIter = QueryEventArticlesIter;
var RequestEvent = /** @class */ (function () {
    function RequestEvent() {
    }
    return RequestEvent;
}());
exports.RequestEvent = RequestEvent;
/**
 * @class RequestEventInfo
 * Return details about an event
 */
var RequestEventInfo = /** @class */ (function (_super) {
    __extends(RequestEventInfo, _super);
    function RequestEventInfo(returnInfo) {
        if (returnInfo === void 0) { returnInfo = new returnInfo_1.ReturnInfo(); }
        var _this = _super.call(this) || this;
        _this.resultType = "info";
        _this.params = returnInfo.getParams("info");
        return _this;
    }
    return RequestEventInfo;
}(RequestEvent));
exports.RequestEventInfo = RequestEventInfo;
/**
 * @class RequestEventArticles
 * Return articles about the event
 */
var RequestEventArticles = /** @class */ (function (_super) {
    __extends(RequestEventArticles, _super);
    function RequestEventArticles(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        _this.resultType = "articles";
        var _a = args.page, page = _a === void 0 ? 1 : _a, _b = args.count, count = _b === void 0 ? 20 : _b, _c = args.lang, lang = _c === void 0 ? base_1.mainLangs : _c, _d = args.sortBy, sortBy = _d === void 0 ? "cosSim" : _d, _e = args.sortByAsc, sortByAsc = _e === void 0 ? false : _e, _f = args.returnInfo, returnInfo = _f === void 0 ? new returnInfo_1.ReturnInfo({ articleInfo: new returnInfo_1.ArticleInfoFlags({ bodyLen: 200 }) }) : _f;
        if (page < 1) {
            throw new RangeError("Page has to be >= 1");
        }
        if (count > 200) {
            throw new RangeError("At most 200 articles can be returned per call");
        }
        _this.params = {};
        _this.params["articlesPage"] = page;
        _this.params["articlesCount"] = count;
        _this.params["articlesLang"] = lang;
        _this.params["articlesSortBy"] = sortBy;
        _this.params["articlesSortByAsc"] = sortByAsc;
        _this.params = _.extend({}, _this.params, returnInfo.getParams("articles"));
        return _this;
    }
    return RequestEventArticles;
}(RequestEvent));
exports.RequestEventArticles = RequestEventArticles;
/**
 * @class RequestEventArticleUris
 * Return just a list of article uris
 */
var RequestEventArticleUris = /** @class */ (function (_super) {
    __extends(RequestEventArticleUris, _super);
    function RequestEventArticleUris(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        _this.resultType = "articleUris";
        var _a = args.lang, lang = _a === void 0 ? base_1.mainLangs : _a, _b = args.sortBy, sortBy = _b === void 0 ? "cosSim" : _b, _c = args.sortByAsc, sortByAsc = _c === void 0 ? false : _c;
        _this.params = {};
        _this.params["articleUrisLang"] = lang;
        _this.params["articleUrisSortBy"] = sortBy;
        _this.params["articleUrisSortByAsc"] = sortByAsc;
        return _this;
    }
    return RequestEventArticleUris;
}(RequestEvent));
exports.RequestEventArticleUris = RequestEventArticleUris;
/**
 * @class RequestEventKeywordAggr
 * Return keyword aggregate (tag-cloud) from articles in the event.
 */
var RequestEventKeywordAggr = /** @class */ (function (_super) {
    __extends(RequestEventKeywordAggr, _super);
    /**
     * @param lang: language for which to compute the keywords
     */
    function RequestEventKeywordAggr(lang) {
        if (lang === void 0) { lang = "eng"; }
        var _this = _super.call(this) || this;
        _this.resultType = "keywordAggr";
        _this.params = {};
        _this.params["keywordAggrLang"] = lang;
        return _this;
    }
    return RequestEventKeywordAggr;
}(RequestEvent));
exports.RequestEventKeywordAggr = RequestEventKeywordAggr;
/**
 * @class RequestEventSourceAggr
 * Get news source distribution of articles in the event.
 */
var RequestEventSourceAggr = /** @class */ (function (_super) {
    __extends(RequestEventSourceAggr, _super);
    function RequestEventSourceAggr() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.resultType = "sourceExAggr";
        return _this;
    }
    return RequestEventSourceAggr;
}(RequestEvent));
exports.RequestEventSourceAggr = RequestEventSourceAggr;
/**
 * @class RequestEventDateMentionAggr
 * Get dates that we found mentioned in the event articles and their frequencies.
 */
var RequestEventDateMentionAggr = /** @class */ (function (_super) {
    __extends(RequestEventDateMentionAggr, _super);
    function RequestEventDateMentionAggr() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.resultType = "dateMentionAggr";
        return _this;
    }
    return RequestEventDateMentionAggr;
}(RequestEvent));
exports.RequestEventDateMentionAggr = RequestEventDateMentionAggr;
/**
 * @class RequestEventArticleTrend
 * Return trending information for the articles about the event.
 */
var RequestEventArticleTrend = /** @class */ (function (_super) {
    __extends(RequestEventArticleTrend, _super);
    function RequestEventArticleTrend(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        _this.resultType = "articleTrend";
        var _a = args.lang, lang = _a === void 0 ? base_1.mainLangs : _a, _b = args.page, page = _b === void 0 ? 1 : _b, _c = args.count, count = _c === void 0 ? 200 : _c, _d = args.minArticleCosSim, minArticleCosSim = _d === void 0 ? -1 : _d, _e = args.returnInfo, returnInfo = _e === void 0 ? new returnInfo_1.ReturnInfo({ articleInfo: new returnInfo_1.ArticleInfoFlags({ bodyLen: 0 }) }) : _e;
        if (page < 1) {
            throw new RangeError("Page has to be >= 1");
        }
        if (count > 200) {
            throw new RangeError("At most 200 articles can be returned per call");
        }
        _this.params = {};
        _this.params["articleTrendLang"] = lang;
        _this.params["articleTrendPage"] = page;
        _this.params["articleTrendCount"] = count;
        _this.params["articleTrendMinArticleCosSim"] = minArticleCosSim;
        _this.params = _.extend({}, _this.params, returnInfo.getParams("articleTrend"));
        return _this;
    }
    return RequestEventArticleTrend;
}(RequestEvent));
exports.RequestEventArticleTrend = RequestEventArticleTrend;
/**
 * @class RequestEventSimilarEvents
 * Compute and return a list of similar events.
 */
var RequestEventSimilarEvents = /** @class */ (function (_super) {
    __extends(RequestEventSimilarEvents, _super);
    function RequestEventSimilarEvents(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        _this.resultType = "similarEvents";
        var _a = args.count, count = _a === void 0 ? 20 : _a, _b = args.maxDayDiff, maxDayDiff = _b === void 0 ? Number.MAX_SAFE_INTEGER : _b, // in place of Python's `sys.maxsize`
        _c = args.addArticleTrendInfo, // in place of Python's `sys.maxsize`
        addArticleTrendInfo = _c === void 0 ? false : _c, _d = args.aggrHours, aggrHours = _d === void 0 ? 6 : _d, _e = args.includeSelf, includeSelf = _e === void 0 ? false : _e, _f = args.returnInfo, returnInfo = _f === void 0 ? new returnInfo_1.ReturnInfo() : _f;
        if (count > 200) {
            throw new RangeError("At most 200 similar events can be returned per call");
        }
        _this.params = {};
        _this.params["similarEventsCount"] = count;
        if (maxDayDiff !== Number.MAX_SAFE_INTEGER) {
            _this.params["similarEventsMaxDayDiff"] = maxDayDiff;
        }
        _this.params["similarEventsAddArticleTrendInfo"] = addArticleTrendInfo;
        _this.params["similarEventsAggrHours"] = aggrHours;
        _this.params["similarEventsIncludeSelf"] = includeSelf;
        _this.params = _.extend({}, _this.params, returnInfo.getParams("similarEvents"));
        return _this;
    }
    return RequestEventSimilarEvents;
}(RequestEvent));
exports.RequestEventSimilarEvents = RequestEventSimilarEvents;
/**
 * @class RequestEventSimilarStories
 * Return a list of similar stories (clusters).
 */
var RequestEventSimilarStories = /** @class */ (function (_super) {
    __extends(RequestEventSimilarStories, _super);
    function RequestEventSimilarStories(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        _this.resultType = "similarStories";
        var _a = args.count, count = _a === void 0 ? 20 : _a, _b = args.source, source = _b === void 0 ? "concept" : _b, _c = args.lang, lang = _c === void 0 ? ["eng"] : _c, _d = args.maxDayDiff, maxDayDiff = _d === void 0 ? Number.MAX_SAFE_INTEGER : _d, // in place of Python's `sys.maxsize`
        _e = args.returnInfo, // in place of Python's `sys.maxsize`
        returnInfo = _e === void 0 ? new returnInfo_1.ReturnInfo() : _e;
        if (count > 200) {
            throw new RangeError("At most 200 similar stories can be returned per call");
        }
        _this.params = {};
        _this.params["similarStoriesCount"] = count;
        _this.params["similarStoriesSource"] = source;
        _this.params["similarStoriesLang"] = lang;
        if (maxDayDiff !== Number.MAX_SAFE_INTEGER) {
            _this.params["similarStoriesMaxDayDiff"] = maxDayDiff;
        }
        _this.params = _.extend({}, _this.params, returnInfo.getParams("similarStories"));
        return _this;
    }
    return RequestEventSimilarStories;
}(RequestEvent));
exports.RequestEventSimilarStories = RequestEventSimilarStories;
