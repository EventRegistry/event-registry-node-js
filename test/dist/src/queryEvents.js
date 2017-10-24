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
var query_1 = require("./query");
var returnInfo_1 = require("./returnInfo");
/**
 * @class QueryEvents
 * Class for obtaining available info for one or more events in the Event Registry
 */
var QueryEvents = /** @class */ (function (_super) {
    __extends(QueryEvents, _super);
    function QueryEvents(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        _this.params = {};
        var keywords = args.keywords, conceptUri = args.conceptUri, categoryUri = args.categoryUri, sourceUri = args.sourceUri, sourceLocationUri = args.sourceLocationUri, sourceGroupUri = args.sourceGroupUri, locationUri = args.locationUri, lang = args.lang, dateStart = args.dateStart, dateEnd = args.dateEnd, _a = args.minArticlesInEvent, minArticlesInEvent = _a === void 0 ? 0 : _a, _b = args.maxArticlesInEvent, maxArticlesInEvent = _b === void 0 ? Number.MAX_SAFE_INTEGER : _b, // in place of Python's `sys.maxsize`
        dateMentionStart = args.dateMentionStart, dateMentionEnd = args.dateMentionEnd, ignoreKeywords = args.ignoreKeywords, ignoreConceptUri = args.ignoreConceptUri, ignoreCategoryUri = args.ignoreCategoryUri, ignoreSourceUri = args.ignoreSourceUri, ignoreSourceLocationUri = args.ignoreSourceLocationUri, ignoreSourceGroupUri = args.ignoreSourceGroupUri, ignoreLocationUri = args.ignoreLocationUri, ignoreLang = args.ignoreLang, _c = args.keywordsLoc, keywordsLoc = _c === void 0 ? "body" : _c, _d = args.ignoreKeywordsLoc, ignoreKeywordsLoc = _d === void 0 ? "body" : _d, _e = args.categoryIncludeSub, categoryIncludeSub = _e === void 0 ? true : _e, _f = args.ignoreCategoryIncludeSub, ignoreCategoryIncludeSub = _f === void 0 ? true : _f, _g = args.requestedResult, requestedResult = _g === void 0 ? new RequestEventsInfo() : _g;
        _this.setVal("action", "getEvents");
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
        _this.setValIfNotDefault("minArticlesInEvent", minArticlesInEvent, 0);
        _this.setValIfNotDefault("maxArticlesInEvent", maxArticlesInEvent, Number.MAX_SAFE_INTEGER);
        if (!_.isUndefined(dateMentionStart)) {
            _this.setDateVal("dateMentionStart", dateMentionStart);
        }
        if (!_.isUndefined(dateMentionEnd)) {
            _this.setDateVal("dateMentionEnd", dateMentionEnd);
        }
        // for the negative conditions, only the OR is a valid operator type
        _this.setQueryArrVal(ignoreKeywords, "ignoreKeywords", undefined, "or");
        _this.setQueryArrVal(ignoreConceptUri, "ignoreConceptUri", undefined, "or");
        _this.setQueryArrVal(ignoreCategoryUri, "ignoreCategoryUri", undefined, "or");
        _this.setQueryArrVal(ignoreSourceUri, "ignoreSourceUri", undefined, "or");
        _this.setQueryArrVal(ignoreLocationUri, "ignoreLocationUri", undefined, "or");
        _this.setQueryArrVal(ignoreLang, "ignoreLang", undefined, "or");
        _this.setValIfNotDefault("keywordLoc", keywordsLoc, "body");
        _this.setValIfNotDefault("ignoreKeywordLoc", ignoreKeywordsLoc, "body");
        _this.setValIfNotDefault("categoryIncludeSub", categoryIncludeSub, true);
        _this.setValIfNotDefault("ignoreCategoryIncludeSub", ignoreCategoryIncludeSub, true);
        _this.addRequestedResult(requestedResult);
        return _this;
    }
    Object.defineProperty(QueryEvents.prototype, "path", {
        get: function () {
            return "/json/event";
        },
        enumerable: true,
        configurable: true
    });
    /**
     *  Add a result type that you would like to be returned.
     * In case you are a subscribed customer you can ask for multiple result types
     * in a single query (for free users, only a single result type can be required per call).
     * Result types can be the classes that extend RequestEvents base class (see classes below).
     */
    QueryEvents.prototype.addRequestedResult = function (requestEvents) {
        if (!(requestEvents instanceof RequestEvents)) {
            throw new Error("QueryEvents class can only accept result requests that are of type RequestEvents");
        }
        this.resultTypeList = _.filter(this.resultTypeList, function (item) { return item["resultType"] !== requestEvents["resultType"]; }).concat([
            requestEvents,
        ]);
    };
    /**
     * Set the single result type that you would like to be returned. Any previously set result types will be overwritten.
     * Result types can be the classes that extend RequestEvent base class (see classes below).
     */
    QueryEvents.prototype.setRequestedResult = function (requestEvents) {
        if (!(requestEvents instanceof RequestEvents)) {
            throw new Error("QueryEvents class can only accept result requests that are of type RequestEvents");
        }
        this.resultTypeList = [
            requestEvents,
        ];
    };
    /**
     * Set a custom list of event uris. The results will be then computed on this list - no query will be done (all conditions will be ignored).
     */
    QueryEvents.initWithEventUriList = function (uriList) {
        var query = new QueryEvents();
        if (!_.isArray(uriList)) {
            throw new Error("uriList has to be a list of strings that represent event uris");
        }
        query.params = {
            action: "getEvents",
            eventUriList: _.join(uriList, ","),
        };
        return query;
    };
    QueryEvents.initWithComplexQuery = function (query, complexQuery) {
        if (complexQuery instanceof query_1.ComplexEventQuery) {
            query.setVal("query", JSON.stringify(complexQuery.getQuery()));
        }
        else if (_.isString(complexQuery)) {
            query.setVal("query", complexQuery);
        }
        else if (_.isObject(complexQuery)) {
            query.setVal("query", JSON.stringify(complexQuery));
        }
        else {
            throw new Error("The instance of query parameter was not a ComplexEventQuery, a string or an object");
        }
        return query;
    };
    return QueryEvents;
}(base_1.Query));
exports.QueryEvents = QueryEvents;
/**
 * @class QueryEventsIter
 * Class for iterating through all the events via callbacks
 */
var QueryEventsIter = /** @class */ (function (_super) {
    __extends(QueryEventsIter, _super);
    function QueryEventsIter(er, args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this, args) || this;
        _this.uriPage = 0;
        var _a = args.sortBy, sortBy = _a === void 0 ? "rel" : _a, _b = args.sortByAsc, sortByAsc = _b === void 0 ? false : _b, _c = args.returnInfo, returnInfo = _c === void 0 ? new returnInfo_1.ReturnInfo() : _c, _d = args.eventBatchSize, eventBatchSize = _d === void 0 ? 200 : _d, _e = args.maxItems, maxItems = _e === void 0 ? -1 : _e;
        _this.er = er;
        _this.sortBy = sortBy;
        _this.sortByAsc = sortByAsc;
        _this.returnInfo = returnInfo;
        _this.eventBatchSize = eventBatchSize;
        _this.maxItems = maxItems;
        return _this;
    }
    /**
     * Execute query and fetch batches of articles of the specified size (eventBatchSize)
     * @param callback callback function that'll be called every time we get a new batch of events from the backend
     * @param doneCallback callback function that'll be called when everything is complete
     */
    QueryEventsIter.prototype.execQuery = function (callback, doneCallback) {
        this.getNextBatch(callback, doneCallback);
    };
    QueryEventsIter.initWithComplexQuery = function (query, complexQuery) {
        if (complexQuery instanceof query_1.ComplexEventQuery) {
            query.setVal("query", JSON.stringify(complexQuery.getQuery()));
        }
        else if (_.isString(complexQuery)) {
            query.setVal("query", complexQuery);
        }
        else if (_.isObject(complexQuery)) {
            query.setVal("query", JSON.stringify(complexQuery));
        }
        else {
            throw new Error("The instance of query parameter was not a ComplexEventQuery, a string or an object");
        }
        return query;
    };
    QueryEventsIter.prototype.getNextUriPage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var requestEventsUriWgtList, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.uriPage++;
                        this.uriWgtList = [];
                        if (!this.allUriPages && this.uriPage > this.allUriPages) {
                            return [2 /*return*/];
                        }
                        requestEventsUriWgtList = new RequestEventsUriWgtList({ page: this.uriPage, sortBy: this.sortBy, sortByAsc: this.sortByAsc });
                        this.setRequestedResult(requestEventsUriWgtList);
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
    Object.defineProperty(QueryEventsIter.prototype, "batchSize", {
        get: function () {
            if (this.maxItems === -1) {
                return this.eventBatchSize;
            }
            var toReturnSize = this.maxItems - this.returnedDataSize;
            return toReturnSize < this.eventBatchSize ? toReturnSize : this.eventBatchSize;
        },
        enumerable: true,
        configurable: true
    });
    QueryEventsIter.prototype.getNextBatch = function (callback, doneCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var uriWgts, uris, q, requestEventsInfo, res;
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
                        q = QueryEvents.initWithEventUriList(uris);
                        requestEventsInfo = new RequestEventsInfo({ count: this.batchSize, sortBy: "none", returnInfo: this.returnInfo });
                        q.setRequestedResult(requestEventsInfo);
                        return [4 /*yield*/, this.er.execQuery(q)];
                    case 3:
                        res = _a.sent();
                        this.returnedDataSize += _.size(uris);
                        callback(_.get(res, "events.results"), _.get(res, "error"));
                        if (this.uriPage <= this.allUriPages) {
                            this.getNextBatch(callback, doneCallback);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return QueryEventsIter;
}(QueryEvents));
exports.QueryEventsIter = QueryEventsIter;
var RequestEvents = /** @class */ (function () {
    function RequestEvents() {
    }
    return RequestEvents;
}());
exports.RequestEvents = RequestEvents;
/**
 * @class RequestEventsInfo
 * Return event details for resulting events.
 */
var RequestEventsInfo = /** @class */ (function (_super) {
    __extends(RequestEventsInfo, _super);
    function RequestEventsInfo(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        _this.resultType = "events";
        var _a = args.page, page = _a === void 0 ? 1 : _a, _b = args.count, count = _b === void 0 ? 20 : _b, _c = args.sortBy, sortBy = _c === void 0 ? "rel" : _c, _d = args.sortByAsc, sortByAsc = _d === void 0 ? false : _d, _e = args.returnInfo, returnInfo = _e === void 0 ? new returnInfo_1.ReturnInfo() : _e;
        if (page < 1) {
            throw new RangeError("Page has to be >= 1");
        }
        if (count > 200) {
            throw new RangeError("At most 200 articles can be returned per call");
        }
        _this.params = {};
        _this.params["eventsPage"] = page;
        _this.params["eventsCount"] = count;
        _this.params["eventsSortBy"] = sortBy;
        _this.params["eventsSortByAsc"] = sortByAsc;
        _this.params = _.extend({}, _this.params, returnInfo.getParams("events"));
        return _this;
    }
    return RequestEventsInfo;
}(RequestEvents));
exports.RequestEventsInfo = RequestEventsInfo;
/**
 * @class RequestEventsUriList
 * Return a simple list of event uris for resulting events.
 */
var RequestEventsUriList = /** @class */ (function (_super) {
    __extends(RequestEventsUriList, _super);
    function RequestEventsUriList(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        _this.resultType = "uriList";
        var _a = args.page, page = _a === void 0 ? 1 : _a, _b = args.count, count = _b === void 0 ? 100000 : _b, _c = args.sortBy, sortBy = _c === void 0 ? "rel" : _c, _d = args.sortByAsc, sortByAsc = _d === void 0 ? false : _d;
        if (page < 1) {
            throw new RangeError("Page has to be >= 1");
        }
        if (count > 300000) {
            throw new RangeError("At most 300000 results can be returned per call");
        }
        _this.params = {};
        _this.params["uriListPage"] = page;
        _this.params["uriListCount"] = count;
        _this.params["uriListSortBy"] = sortBy;
        _this.params["uriListSortByAsc"] = sortByAsc;
        return _this;
    }
    Object.defineProperty(RequestEventsUriList.prototype, "page", {
        set: function (page) {
            if (page < 1) {
                throw new RangeError("Page has to be >= 1");
            }
            _.set(this.params, "uriListPage", page);
        },
        enumerable: true,
        configurable: true
    });
    return RequestEventsUriList;
}(RequestEvents));
exports.RequestEventsUriList = RequestEventsUriList;
/**
 * @class RequestEventsUriList
 * Return a simple list of event uris together with the scores for resulting events.
 */
var RequestEventsUriWgtList = /** @class */ (function (_super) {
    __extends(RequestEventsUriWgtList, _super);
    function RequestEventsUriWgtList(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        _this.resultType = "uriWgtList";
        var _a = args.page, page = _a === void 0 ? 1 : _a, _b = args.count, count = _b === void 0 ? 100000 : _b, _c = args.sortBy, sortBy = _c === void 0 ? "rel" : _c, _d = args.sortByAsc, sortByAsc = _d === void 0 ? false : _d;
        if (page < 1) {
            throw new RangeError("Page has to be >= 1");
        }
        if (count > 300000) {
            throw new RangeError("At most 300000 results can be returned per call");
        }
        _this.params = {};
        _this.params["uriWgtListPage"] = page;
        _this.params["uriWgtListCount"] = count;
        _this.params["uriWgtListSortBy"] = sortBy;
        _this.params["uriWgtListSortByAsc"] = sortByAsc;
        return _this;
    }
    Object.defineProperty(RequestEventsUriWgtList.prototype, "page", {
        set: function (page) {
            if (page < 1) {
                throw new RangeError("Page has to be >= 1");
            }
            _.set(this.params, "uriWgtListPage", page);
        },
        enumerable: true,
        configurable: true
    });
    return RequestEventsUriWgtList;
}(RequestEvents));
exports.RequestEventsUriWgtList = RequestEventsUriWgtList;
/**
 * @class RequestEventsTimeAggr
 * Return time distribution of resulting events.
 */
var RequestEventsTimeAggr = /** @class */ (function (_super) {
    __extends(RequestEventsTimeAggr, _super);
    function RequestEventsTimeAggr() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.resultType = "timeAggr";
        return _this;
    }
    return RequestEventsTimeAggr;
}(RequestEvents));
exports.RequestEventsTimeAggr = RequestEventsTimeAggr;
/**
 * Return keyword aggregate (tag cloud) on words in articles in resulting events.
 * @class RequestEventsTimeAggr
 */
var RequestEventsKeywordAggr = /** @class */ (function (_super) {
    __extends(RequestEventsKeywordAggr, _super);
    function RequestEventsKeywordAggr(lang) {
        if (lang === void 0) { lang = "eng"; }
        var _this = _super.call(this) || this;
        _this.resultType = "keywordAggr";
        _this.params = {};
        _this.params["keywordAggrLang"] = lang;
        return _this;
    }
    return RequestEventsKeywordAggr;
}(RequestEvents));
exports.RequestEventsKeywordAggr = RequestEventsKeywordAggr;
/**
 * @class RequestEventsLocAggr
 * Return aggregate of locations of resulting events.
 */
var RequestEventsLocAggr = /** @class */ (function (_super) {
    __extends(RequestEventsLocAggr, _super);
    function RequestEventsLocAggr(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        _this.resultType = "locAggr";
        var _a = args.eventsSampleSize, eventsSampleSize = _a === void 0 ? 100000 : _a, _b = args.returnInfo, returnInfo = _b === void 0 ? new returnInfo_1.ReturnInfo() : _b;
        if (eventsSampleSize > 300000) {
            throw new RangeError("At most 300000 results can be used for computing");
        }
        _this.params = {};
        _this.params["locAggrSampleSize"] = eventsSampleSize;
        _this.params = _.extend({}, _this.params, returnInfo.getParams("locAggr"));
        return _this;
    }
    return RequestEventsLocAggr;
}(RequestEvents));
exports.RequestEventsLocAggr = RequestEventsLocAggr;
/**
 * @class RequestEventsLocTimeAggr
 * Return aggregate of locations and times of resulting events.
 */
var RequestEventsLocTimeAggr = /** @class */ (function (_super) {
    __extends(RequestEventsLocTimeAggr, _super);
    function RequestEventsLocTimeAggr(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        _this.resultType = "locTimeAggr";
        var _a = args.eventsSampleSize, eventsSampleSize = _a === void 0 ? 100000 : _a, _b = args.returnInfo, returnInfo = _b === void 0 ? new returnInfo_1.ReturnInfo() : _b;
        if (eventsSampleSize > 300000) {
            throw new RangeError("At most 300000 results can be used for computing");
        }
        _this.params = {};
        _this.params["locTimeAggrSampleSize"] = eventsSampleSize;
        _this.params = _.extend({}, _this.params, returnInfo.getParams("locTimeAggr"));
        return _this;
    }
    return RequestEventsLocTimeAggr;
}(RequestEvents));
exports.RequestEventsLocTimeAggr = RequestEventsLocTimeAggr;
/**
 * @class RequestEventsConceptAggr
 * Compute which concept are the most frequently occurring in the list of resulting events.
 */
var RequestEventsConceptAggr = /** @class */ (function (_super) {
    __extends(RequestEventsConceptAggr, _super);
    function RequestEventsConceptAggr(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        _this.resultType = "conceptAggr";
        var _a = args.conceptCount, conceptCount = _a === void 0 ? 20 : _a, _b = args.eventsSampleSize, eventsSampleSize = _b === void 0 ? 100000 : _b, _c = args.returnInfo, returnInfo = _c === void 0 ? new returnInfo_1.ReturnInfo() : _c;
        if (conceptCount > 200) {
            throw new RangeError("At most 200 top concepts can be returned");
        }
        if (eventsSampleSize > 300000) {
            throw new RangeError("At most 300000 results can be used for computing");
        }
        _this.params = {};
        _this.params["conceptAggrConceptCount"] = conceptCount;
        _this.params["conceptAggrSampleSize"] = eventsSampleSize;
        _this.params = _.extend({}, _this.params, returnInfo.getParams("conceptAggr"));
        return _this;
    }
    return RequestEventsConceptAggr;
}(RequestEvents));
exports.RequestEventsConceptAggr = RequestEventsConceptAggr;
/**
 * @class RequestEventsConceptGraph
 * Compute which concept pairs frequently co-occur together in the resulting events.
 */
var RequestEventsConceptGraph = /** @class */ (function (_super) {
    __extends(RequestEventsConceptGraph, _super);
    function RequestEventsConceptGraph(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        _this.resultType = "conceptGraph";
        var _a = args.conceptCount, conceptCount = _a === void 0 ? 25 : _a, _b = args.linkCount, linkCount = _b === void 0 ? 50 : _b, _c = args.eventsSampleSize, eventsSampleSize = _c === void 0 ? 100000 : _c, _d = args.returnInfo, returnInfo = _d === void 0 ? new returnInfo_1.ReturnInfo() : _d;
        if (conceptCount > 1000) {
            throw new RangeError("At most 1000 top concepts can be returned");
        }
        if (linkCount > 2000) {
            throw new RangeError("At most 2000 links between concepts can be returned");
        }
        if (eventsSampleSize > 300000) {
            throw new RangeError("At most 300000 results can be used for computing");
        }
        _this.params = {};
        _this.params["conceptGraphConceptCount"] = conceptCount;
        _this.params["conceptGraphLinkCount"] = linkCount;
        _this.params["conceptGraphSampleSize"] = eventsSampleSize;
        _this.params = _.extend({}, _this.params, returnInfo.getParams("conceptGraph"));
        return _this;
    }
    return RequestEventsConceptGraph;
}(RequestEvents));
exports.RequestEventsConceptGraph = RequestEventsConceptGraph;
/**
 * @class RequestEventsConceptMatrix
 * Get a matrix of concepts and their dependencies.
 * For individual concept pairs return how frequently
 * they co-occur in the resulting events and how "surprising" this is,
 * based on the frequency of individual concepts.
 */
var RequestEventsConceptMatrix = /** @class */ (function (_super) {
    __extends(RequestEventsConceptMatrix, _super);
    function RequestEventsConceptMatrix(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        _this.resultType = "conceptMatrix";
        var _a = args.conceptCount, conceptCount = _a === void 0 ? 25 : _a, _b = args.measure, measure = _b === void 0 ? "pmi" : _b, _c = args.eventsSampleSize, eventsSampleSize = _c === void 0 ? 100000 : _c, _d = args.returnInfo, returnInfo = _d === void 0 ? new returnInfo_1.ReturnInfo() : _d;
        if (conceptCount > 200) {
            throw new RangeError("At most 200 top concepts can be returned");
        }
        if (eventsSampleSize > 300000) {
            throw new RangeError("At most 300000 results can be used for computing");
        }
        _this.params = {};
        _this.params["conceptMatrixConceptCount"] = conceptCount;
        _this.params["conceptMatrixMeasure"] = measure;
        _this.params["conceptMatrixSampleSize"] = eventsSampleSize;
        _this.params = _.extend({}, _this.params, returnInfo.getParams("conceptMatrix"));
        return _this;
    }
    return RequestEventsConceptMatrix;
}(RequestEvents));
exports.RequestEventsConceptMatrix = RequestEventsConceptMatrix;
/**
 * @class RequestEventsConceptTrends
 * Return a list of top trending concepts and their daily trending info over time
 */
var RequestEventsConceptTrends = /** @class */ (function (_super) {
    __extends(RequestEventsConceptTrends, _super);
    function RequestEventsConceptTrends(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        _this.resultType = "conceptTrends";
        var _a = args.conceptCount, conceptCount = _a === void 0 ? 10 : _a, _b = args.returnInfo, returnInfo = _b === void 0 ? new returnInfo_1.ReturnInfo() : _b;
        if (conceptCount > 50) {
            throw new RangeError("At most 50 top concepts can be returned");
        }
        _this.params = {};
        _this.params["conceptTrendsConceptCount"] = conceptCount;
        _this.params = _.extend({}, _this.params, returnInfo.getParams("conceptTrends"));
        return _this;
    }
    return RequestEventsConceptTrends;
}(RequestEvents));
exports.RequestEventsConceptTrends = RequestEventsConceptTrends;
/**
 * @class RequestEventsSourceAggr
 * Return top news sources that report about the events that match the search conditions
 */
var RequestEventsSourceAggr = /** @class */ (function (_super) {
    __extends(RequestEventsSourceAggr, _super);
    function RequestEventsSourceAggr(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        _this.resultType = "sourceAggr";
        var _a = args.sourceCount, sourceCount = _a === void 0 ? 30 : _a, _b = args.eventsSampleSize, eventsSampleSize = _b === void 0 ? 100000 : _b, _c = args.returnInfo, returnInfo = _c === void 0 ? new returnInfo_1.ReturnInfo() : _c;
        if (sourceCount > 200) {
            throw new RangeError("At most 200 top sources can be returned");
        }
        if (eventsSampleSize > 300000) {
            throw new RangeError("At most 300000 results can be used for computing");
        }
        _this.params = {};
        _this.params["sourceAggrSourceCount"] = sourceCount;
        _this.params["sourceAggrSampleSize"] = eventsSampleSize;
        _this.params = _.extend({}, _this.params, returnInfo.getParams("sourceAggr"));
        return _this;
    }
    return RequestEventsSourceAggr;
}(RequestEvents));
exports.RequestEventsSourceAggr = RequestEventsSourceAggr;
/**
 * @class RequestEventsDateMentionAggr
 * Return events and the dates that are mentioned in articles about these events
 */
var RequestEventsDateMentionAggr = /** @class */ (function (_super) {
    __extends(RequestEventsDateMentionAggr, _super);
    function RequestEventsDateMentionAggr(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        _this.resultType = "dateMentionAggr";
        var _a = args.minDaysApart, minDaysApart = _a === void 0 ? 0 : _a, _b = args.minDateMentionCount, minDateMentionCount = _b === void 0 ? 5 : _b, _c = args.eventsSampleSize, eventsSampleSize = _c === void 0 ? 100000 : _c, _d = args.returnInfo, returnInfo = _d === void 0 ? new returnInfo_1.ReturnInfo() : _d;
        if (eventsSampleSize > 300000) {
            throw new RangeError("At most 300000 results can be used for computing");
        }
        _this.params = {};
        _this.params["dateMentionAggrMinDaysApart"] = minDaysApart;
        _this.params["dateMentionAggrMinDateMentionCount"] = minDateMentionCount;
        _this.params["dateMentionAggrSampleSize"] = eventsSampleSize;
        _this.params = _.extend({}, _this.params, returnInfo.getParams("dateMentionAggr"));
        return _this;
    }
    return RequestEventsDateMentionAggr;
}(RequestEvents));
exports.RequestEventsDateMentionAggr = RequestEventsDateMentionAggr;
/**
 * @class RequestEventsEventClusters
 * Return hierarchical clustering of events into smaller clusters. 2-means clustering is applied on each node in the tree
 */
var RequestEventsEventClusters = /** @class */ (function (_super) {
    __extends(RequestEventsEventClusters, _super);
    function RequestEventsEventClusters(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        _this.resultType = "eventClusters";
        var _a = args.keywordCount, keywordCount = _a === void 0 ? 30 : _a, _b = args.maxEventsToCluster, maxEventsToCluster = _b === void 0 ? 10000 : _b, _c = args.returnInfo, returnInfo = _c === void 0 ? new returnInfo_1.ReturnInfo() : _c;
        if (keywordCount > 100) {
            throw new RangeError("At most 100 keywords can be reported in each of the clusters");
        }
        if (maxEventsToCluster > 10000) {
            throw new RangeError("At most 10000 events can be clustered together");
        }
        _this.params = {};
        _this.params["eventClustersKeywordCount"] = keywordCount;
        _this.params["eventClustersMaxEventsToCluster"] = maxEventsToCluster;
        _this.params = _.extend({}, _this.params, returnInfo.getParams("eventClusters"));
        return _this;
    }
    return RequestEventsEventClusters;
}(RequestEvents));
exports.RequestEventsEventClusters = RequestEventsEventClusters;
/**
 * @class RequestEventsCategoryAggr
 * Return distribution of events into dmoz categories.
 */
var RequestEventsCategoryAggr = /** @class */ (function (_super) {
    __extends(RequestEventsCategoryAggr, _super);
    function RequestEventsCategoryAggr(returnInfo) {
        if (returnInfo === void 0) { returnInfo = new returnInfo_1.ReturnInfo(); }
        var _this = _super.call(this) || this;
        _this.resultType = "categoryAggr";
        _this.params = returnInfo.getParams("categoryAggr");
        return _this;
    }
    return RequestEventsCategoryAggr;
}(RequestEvents));
exports.RequestEventsCategoryAggr = RequestEventsCategoryAggr;
/**
 * @class RequestEventsRecentActivity
 * Return a list of recently changed events that match search conditions.
 */
var RequestEventsRecentActivity = /** @class */ (function (_super) {
    __extends(RequestEventsRecentActivity, _super);
    function RequestEventsRecentActivity(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        _this.resultType = "recentActivity";
        var _a = args.maxEventCount, maxEventCount = _a === void 0 ? 60 : _a, updatesAfterTm = args.updatesAfterTm, updatesAfterMinsAgo = args.updatesAfterMinsAgo, _b = args.mandatoryLocation, mandatoryLocation = _b === void 0 ? true : _b, lang = args.lang, _c = args.minAvgCosSim, minAvgCosSim = _c === void 0 ? 0 : _c, _d = args.returnInfo, returnInfo = _d === void 0 ? new returnInfo_1.ReturnInfo() : _d;
        if (maxEventCount > 2000) {
            throw new RangeError("At most 2000 events can be returned");
        }
        if (!_.isUndefined(updatesAfterTm) && !_.isUndefined(updatesAfterMinsAgo)) {
            throw new Error("You should specify either updatesAfterTm or updatesAfterMinsAgo parameter, but not both");
        }
        _this.params["recentActivityEventsMaxEventCount"] = maxEventCount;
        _this.params["recentActivityEventsMandatoryLocation"] = mandatoryLocation;
        if (!_.isUndefined(updatesAfterTm)) {
            _this.params["recentActivityEventsUpdatesAfterTm"] = base_1.QueryParamsBase.encodeDateTime(updatesAfterTm);
        }
        if (!_.isUndefined(updatesAfterMinsAgo)) {
            _this.params["recentActivityEventsUpdatesAfterMinsAgo"] = updatesAfterMinsAgo;
        }
        if (!_.isUndefined(lang)) {
            _this.params["recentActivityEventsLang"] = lang;
        }
        _this.params["recentActivityEventsMinAvgCosSim"] = minAvgCosSim;
        _this.params = _.extend({}, _this.params, returnInfo.getParams("recentActivityEvents"));
        return _this;
    }
    return RequestEventsRecentActivity;
}(RequestEvents));
exports.RequestEventsRecentActivity = RequestEventsRecentActivity;
//# sourceMappingURL=queryEvents.js.map