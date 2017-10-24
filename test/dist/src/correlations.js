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
var counts_1 = require("./counts");
var info_1 = require("./info");
var queryArticles_1 = require("./queryArticles");
var returnInfo_1 = require("./returnInfo");
/**
 * @class GetTopCorrelations
 * Provides classes needed to identify concepts or categories
 * that trend the most with a concept, category or a custom time series
 */
var GetTopCorrelations = /** @class */ (function (_super) {
    __extends(GetTopCorrelations, _super);
    function GetTopCorrelations(er) {
        var _this = _super.call(this) || this;
        _this.er = er;
        _this.setVal("action", "findTopCorrelations");
        return _this;
    }
    Object.defineProperty(GetTopCorrelations.prototype, "path", {
        get: function () {
            return "/json/correlate";
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Specify the user defined array of input data
     * @param inputDataArr: array of tuples (date, val) where date is a date object or string in YYYY-MM-DD format and val is the value/counts for that date
     */
    GetTopCorrelations.prototype.setCustomInputData = function (inputDataArr) {
        this.clearVal("testData");
        for (var _i = 0, inputDataArr_1 = inputDataArr; _i < inputDataArr_1.length; _i++) {
            var _a = inputDataArr_1[_i], date = _a.date, val = _a.val;
            if (!_.isNumber(val)) {
                throw new Error("Value is expected to be a number");
            }
            this.addArrayVal("testData", { date: base_1.QueryParamsBase.encodeDateTime(date), count: val });
        }
    };
    /**
     * Use the queryArticles to find articles that match the criteria. For the articles that match
     * criteria in queryArticles compute the time-series (number of resulting articles for each date)
     * an use the time series as the input data.
     * @param queryArticles An instance of QueryArticles class, containing the conditions that are use to find the matching time-series. You don't need to specify any requested result.
     */
    GetTopCorrelations.prototype.loadInputDataWithQuery = function (queryArticles) {
        return __awaiter(this, void 0, void 0, function () {
            var requestArticlesTimeAggr, response, _i, _a, object;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.clearVal("testData");
                        if (!(queryArticles instanceof queryArticles_1.QueryArticles)) {
                            throw new Error("'queryArticles' expected to be an instance of QueryArticles");
                        }
                        requestArticlesTimeAggr = new queryArticles_1.RequestArticlesTimeAggr();
                        queryArticles.setRequestedResult(requestArticlesTimeAggr);
                        return [4 /*yield*/, this.er.execQuery(queryArticles)];
                    case 1:
                        response = _b.sent();
                        if (_.has(response, "timeAggr")) {
                            // Potential issue if response["timeAggr"] is an object
                            for (_i = 0, _a = response["timeAggr"]; _i < _a.length; _i++) {
                                object = _a[_i];
                                this.addArrayVal("testData", JSON.stringify(object));
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Use GetCounts class to obtain daily counts information for concept/category of interest.
     * @param getCounts An instance of GetCounts class.
     */
    GetTopCorrelations.prototype.loadInputDataWithCounts = function (getCounts) {
        return __awaiter(this, void 0, void 0, function () {
            var response, key, _i, _a, object;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.clearVal("testData");
                        if (!(getCounts instanceof counts_1.GetCounts)) {
                            throw new Error("'getCounts' is expected to be an instance of GetCounts");
                        }
                        return [4 /*yield*/, this.er.execQuery(getCounts)];
                    case 1:
                        response = _b.sent();
                        if (_.size(response) > 1) {
                            throw new Error("The returned object had multiple keys. When creating the GetCounts instance use only one uri.");
                        }
                        if (_.isEmpty(response)) {
                            throw new Error("Obtained an empty object");
                        }
                        if (_.has(response, "error")) {
                            throw new Error(_.get(response, "error"));
                        }
                        key = _.first(_.keys(response));
                        if (!_.isArray(response[key])) {
                            throw new Error("Expected an array");
                        }
                        for (_i = 0, _a = response[key]; _i < _a.length; _i++) {
                            object = _a[_i];
                            this.addArrayVal("testData", JSON.stringify(object));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Do we have valid input data (needed before we can compute correlations)
     */
    GetTopCorrelations.prototype.hasValidInputData = function () {
        return this.hasVal("testData");
    };
    /**
     * Compute concepts that correlate the most with the input data. If candidateConceptsQuery is provided we first identify the
     * concepts that are potentially returned as top correlations. Candidates are obtained by making the query and analyzing the
     * concepts that appear in the resulting articles. The top concepts are used as candidates among which we return the top correlations.
     * If conceptType is provided then only concepts of the specified type can be provided as the result.
     *
     * @param args Object which contains a host of optional parameters
     */
    GetTopCorrelations.prototype.getTopConceptCorrelations = function (args) {
        if (args === void 0) { args = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, candidateConceptsQuery, _b, candidatesPerType, _c, conceptType, _d, exactCount, _e, approxCount, _f, returnInfo, getTopCorrelations, response, res, corrs, conceptIds, conceptInfos_1, _i, _g, i, ids, q, info;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _a = args.candidateConceptsQuery, candidateConceptsQuery = _a === void 0 ? undefined : _a, _b = args.candidatesPerType, candidatesPerType = _b === void 0 ? 1000 : _b, _c = args.conceptType, conceptType = _c === void 0 ? undefined : _c, _d = args.exactCount, exactCount = _d === void 0 ? 10 : _d, _e = args.approxCount, approxCount = _e === void 0 ? 0 : _e, _f = args.returnInfo, returnInfo = _f === void 0 ? new returnInfo_1.ReturnInfo() : _f;
                        this.clearVal("contextConceptIds");
                        getTopCorrelations = _.cloneDeep(this);
                        if (!!_.isUndefined(candidateConceptsQuery)) return [3 /*break*/, 2];
                        if (!(candidateConceptsQuery instanceof (queryArticles_1.QueryArticles))) {
                            throw new Error("'candidateConceptsQuery' is expected to be of type QueryArticles");
                        }
                        candidateConceptsQuery.setRequestedResult(new queryArticles_1.RequestArticlesConceptAggr());
                        candidateConceptsQuery.setVal("conceptAggrConceptCountPerType", candidatesPerType);
                        candidateConceptsQuery.setVal("conceptAggrConceptIdOnly", true);
                        return [4 /*yield*/, this.er.execQuery(candidateConceptsQuery)];
                    case 1:
                        response = _h.sent();
                        if (_.has(response, "conceptAggr")) {
                            getTopCorrelations.setVal("contextConceptIds", _.join(response["conceptAggr"], ","));
                        }
                        else {
                            console.warn("Warning: Failed to compute a candidate set of concepts");
                        }
                        _h.label = 2;
                    case 2:
                        if (conceptType) {
                            getTopCorrelations.setVal("conceptType", conceptType);
                        }
                        getTopCorrelations.setVal("exactCount", exactCount);
                        getTopCorrelations.setVal("approxCount", approxCount);
                        getTopCorrelations.setVal("sourceType", "news-concept");
                        return [4 /*yield*/, this.er.jsonRequest(this.path, getTopCorrelations.params)];
                    case 3:
                        res = _h.sent();
                        if (!!_.isUndefined(returnInfo)) return [3 /*break*/, 8];
                        corrs = _.get(res, "news-concept.exactCorrelations", []).concat(_.get(res, "news-concept.approximateCorrelations", []));
                        conceptIds = _.map(corrs, "id");
                        conceptInfos_1 = {};
                        _i = 0, _g = _.range(0, _.size(conceptIds), 500);
                        _h.label = 4;
                    case 4:
                        if (!(_i < _g.length)) return [3 /*break*/, 7];
                        i = _g[_i];
                        ids = _.slice(conceptIds, i, i + 500);
                        q = new info_1.GetConceptInfo({ returnInfo: returnInfo });
                        q.queryById(ids);
                        return [4 /*yield*/, this.er.execQuery(q)];
                    case 5:
                        info = _h.sent();
                        conceptInfos_1 = _.extend({}, conceptInfos_1, info);
                        _h.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7:
                        if (_.has(res, "news-concept.exactCorrelations")) {
                            _.update(res, "news-concept.exactCorrelations", function (items) {
                                return _.map(items, function (item) {
                                    item["conceptInfo"] = _.get(conceptInfos_1, item["id"], {});
                                    return item;
                                });
                            });
                        }
                        if (_.has(res, "news-concept.approximateCorrelations")) {
                            _.update(res, "news-concept.approximateCorrelations", function (items) {
                                return _.map(items, function (item) {
                                    item["conceptInfo"] = _.get(conceptInfos_1, item["id"], {});
                                    return item;
                                });
                            });
                        }
                        _h.label = 8;
                    case 8: return [2 /*return*/, res];
                }
            });
        });
    };
    /**
     * Compute categories that correlate the most with the input data.
     * @param args Object which contains a host of optional parameters
     */
    GetTopCorrelations.prototype.getTopCategoryCorrelations = function (args) {
        if (args === void 0) { args = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, exactCount, _b, approxCount, _c, returnInfo, getTopCorrelations, res, corrs, categoryIds, categoryInfos_1, _i, _d, i, ids, q, info;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _a = args.exactCount, exactCount = _a === void 0 ? 10 : _a, _b = args.approxCount, approxCount = _b === void 0 ? 0 : _b, _c = args.returnInfo, returnInfo = _c === void 0 ? new returnInfo_1.ReturnInfo() : _c;
                        getTopCorrelations = _.cloneDeep(this);
                        getTopCorrelations.clearVal("contextConceptIds");
                        getTopCorrelations.setVal("exactCount", exactCount);
                        getTopCorrelations.setVal("approxCount", approxCount);
                        getTopCorrelations.setVal("sourceType", "news-category");
                        return [4 /*yield*/, this.er.jsonRequest(this.path, getTopCorrelations.params)];
                    case 1:
                        res = _e.sent();
                        if (!_.isUndefined(returnInfo)) {
                            corrs = _.get(res, "news-category.exactCorrelations", []).concat(_.get(res, "news-category.approximateCorrelations", []));
                            categoryIds = _.map(corrs, "id");
                            categoryInfos_1 = {};
                            for (_i = 0, _d = _.range(0, _.size(categoryIds), 500); _i < _d.length; _i++) {
                                i = _d[_i];
                                ids = _.slice(categoryIds, i, i + 500);
                                q = new info_1.GetCategoryInfo({ returnInfo: returnInfo });
                                q.queryById(ids);
                                info = this.er.execQuery(q);
                                categoryInfos_1 = _.extend({}, categoryInfos_1, info);
                            }
                            if (_.has(res, "news-category.exactCorrelations")) {
                                _.update(res, "news-category.exactCorrelations", function (items) {
                                    return _.map(items, function (item) {
                                        item["categoryInfo"] = _.get(categoryInfos_1, item["id"], {});
                                        return item;
                                    });
                                });
                            }
                            if (_.has(res, "news-category.approximateCorrelations")) {
                                _.update(res, "news-category.approximateCorrelations", function (items) {
                                    return _.map(items, function (item) {
                                        item["categoryInfo"] = _.get(categoryInfos_1, item["id"], {});
                                        return item;
                                    });
                                });
                            }
                        }
                        return [2 /*return*/, res];
                }
            });
        });
    };
    return GetTopCorrelations;
}(base_1.QueryParamsBase));
exports.GetTopCorrelations = GetTopCorrelations;
//# sourceMappingURL=correlations.js.map