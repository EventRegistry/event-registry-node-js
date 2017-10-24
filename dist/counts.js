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
// provides classes for obtaining information about how frequently individual concepts or categories
// have been mentioned in news articles (if source == "news") of in social media (if source == "social")
var CountsBase = /** @class */ (function (_super) {
    __extends(CountsBase, _super);
    function CountsBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(CountsBase.prototype, "path", {
        get: function () {
            return "/json/counters";
        },
        enumerable: true,
        configurable: true
    });
    return CountsBase;
}(base_1.QueryParamsBase));
exports.CountsBase = CountsBase;
/**
 * @class GetCounts
 * Obtain information about how frequently a concept or category is mentioned in the articles on particular dates
 * by specifying source="custom" one can obtain counts for custom concepts, such as stocks, macroeconomic indicators, etc. The uri
 * for these can be found using EventRegistry.getCustomConceptUri() method.
 * Usage example:
 *
 *     q = GetCounts([er.getConceptUri("Obama"), er.getConceptUri("ebola")])
 *     ret = er.execQuery(q)
 *
 * Return object:
 *
 *     {
 *         "http://en.wikipedia.org/wiki/Barack_Obama": [
 *             {
 *                 "count": 1,
 *                 "date": "2015-05-07"
 *             },
 *             {
 *                 "count": 4,
 *                 "date": "2015-05-08"
 *             },
 *             ...
 *         ],
 *         "http://en.wikipedia.org/wiki/Ebola_virus_disease": [
 *             {
 *                 "count": 0,
 *                 "date": "2015-05-07"
 *             },
 *             ...
 *         ]
 *     }
 *
 * @param uriOrUriList: concept/category uri or a list of uris
 * @param args Object which contains a host of optional parameters
 */
var GetCounts = /** @class */ (function (_super) {
    __extends(GetCounts, _super);
    function GetCounts(uriOrUriList, args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        var _a = args.source, source = _a === void 0 ? "news" : _a, _b = args.type, type = _b === void 0 ? "concept" : _b, _c = args.startDate, startDate = _c === void 0 ? undefined : _c, _d = args.endDate, endDate = _d === void 0 ? undefined : _d, _e = args.returnInfo, returnInfo = _e === void 0 ? new returnInfo_1.ReturnInfo() : _e;
        _this.setVal("action", "getCounts");
        _this.setVal("source", source);
        _this.setVal("type", type);
        _this.setVal("uri", uriOrUriList);
        if (!_.isUndefined(startDate)) {
            _this.setDateVal("startDate", startDate);
        }
        if (!_.isUndefined(endDate)) {
            _this.setDateVal("startDate", endDate);
        }
        _this.params = _.extend({}, _this.params, returnInfo.getParams());
        return _this;
    }
    return GetCounts;
}(CountsBase));
exports.GetCounts = GetCounts;
/**
 * @class GetCountsEx
 * Obtain information about how frequently a concept or category is mentioned in the articles on particular dates
 * Similar to GetCounts, but the output is more friendly for a larger set of provided uris/ids at once
 * Usage example:
 *     q = GetCountsEx(type = "category")
 *     q.queryById(range(10))  # return trends of first 10 categories
 *     ret = er.execQuery(q)
 * Return object:
 *     {
 *         "categoryInfo": [
 *             {
 *                 "id": 0,
 *                 "label": "Root",
 *                 "uri": "http://www.dmoz.org"
 *             },
 *             {
 *                 "id": 1,
 *                 "label": "Recreation",
 *                 "uri": "http://www.dmoz.org/Recreation"
 *             },
 *             ...
 *         ],
 *         "counts": [
 *             {
 *                 "0": 23, "1": 42, "2": 52, "3": 32, "4": 21, "5": 65, "6": 32, "7": 654, "8": 1, "9": 34,
 *                 "date": "2015-05-07"
 *             },
 *             ...
 *         ]
 *     }
 * @param uriOrUriList: concept/category uri or a list of uris
 * @param args Object which contains a host of optional parameters
 */
var GetCountsEx = /** @class */ (function (_super) {
    __extends(GetCountsEx, _super);
    function GetCountsEx(uriOrUriList, args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        var _a = args.source, source = _a === void 0 ? "news" : _a, _b = args.type, type = _b === void 0 ? "concept" : _b, _c = args.startDate, startDate = _c === void 0 ? undefined : _c, _d = args.endDate, endDate = _d === void 0 ? undefined : _d, _e = args.returnInfo, returnInfo = _e === void 0 ? new returnInfo_1.ReturnInfo() : _e;
        _this.setVal("action", "GetCountsEx");
        _this.setVal("source", source);
        _this.setVal("type", type);
        _this.setVal("uri", uriOrUriList);
        if (!_.isUndefined(startDate)) {
            _this.setDateVal("startDate", startDate);
        }
        if (!_.isUndefined(endDate)) {
            _this.setDateVal("startDate", endDate);
        }
        _this.params = _.extend({}, _this.params, returnInfo.getParams());
        return _this;
    }
    return GetCountsEx;
}(CountsBase));
exports.GetCountsEx = GetCountsEx;
