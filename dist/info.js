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
 * @class GetSourceInfo
 * Obtain desired information about one or more news sources
 */
var GetSourceInfo = /** @class */ (function (_super) {
    __extends(GetSourceInfo, _super);
    /**
     * @param args Object which contains a host of optional parameters
     */
    function GetSourceInfo(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        var _a = args.uriOrUriList, uriOrUriList = _a === void 0 ? undefined : _a, _b = args.returnInfo, returnInfo = _b === void 0 ? new returnInfo_1.ReturnInfo() : _b;
        _this.setVal("action", "getInfo");
        if (!_.isUndefined(uriOrUriList)) {
            _this.queryByUri(uriOrUriList);
        }
        _this.params = _.extend({}, _this.params, returnInfo.getParams("source"));
        return _this;
    }
    /**
     * search sources by uri(s)
     */
    GetSourceInfo.prototype.queryByUri = function (uriOrUriList) {
        this.setVal("uri", uriOrUriList);
    };
    /**
     * search concepts by id(s)
     */
    GetSourceInfo.prototype.queryById = function (idOrIdList) {
        this.setVal("id", idOrIdList);
    };
    Object.defineProperty(GetSourceInfo.prototype, "path", {
        get: function () {
            return "/json/source";
        },
        enumerable: true,
        configurable: true
    });
    return GetSourceInfo;
}(base_1.QueryParamsBase));
exports.GetSourceInfo = GetSourceInfo;
/**
 * @class GetConceptInfo
 * Obtain information about concepts
 */
var GetConceptInfo = /** @class */ (function (_super) {
    __extends(GetConceptInfo, _super);
    function GetConceptInfo(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        var _a = args.uriOrUriList, uriOrUriList = _a === void 0 ? undefined : _a, _b = args.returnInfo, returnInfo = _b === void 0 ? new returnInfo_1.ReturnInfo() : _b;
        _this.setVal("action", "getInfo");
        if (!_.isUndefined(uriOrUriList)) {
            _this.queryByUri(uriOrUriList);
        }
        _this.params = _.extend({}, _this.params, returnInfo.getParams("concept"));
        return _this;
    }
    /**
     * search concepts by uri(s)
     */
    GetConceptInfo.prototype.queryByUri = function (uriOrUriList) {
        this.setVal("uri", uriOrUriList);
    };
    /**
     * search concepts by id(s)
     */
    GetConceptInfo.prototype.queryById = function (idOrIdList) {
        this.setVal("id", idOrIdList);
    };
    Object.defineProperty(GetConceptInfo.prototype, "path", {
        get: function () {
            return "/json/concept";
        },
        enumerable: true,
        configurable: true
    });
    return GetConceptInfo;
}(base_1.QueryParamsBase));
exports.GetConceptInfo = GetConceptInfo;
/**
 * @class GetCategoryInfo
 * Obtain information about categories
 */
var GetCategoryInfo = /** @class */ (function (_super) {
    __extends(GetCategoryInfo, _super);
    function GetCategoryInfo(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        var _a = args.uriOrUriList, uriOrUriList = _a === void 0 ? undefined : _a, _b = args.returnInfo, returnInfo = _b === void 0 ? new returnInfo_1.ReturnInfo() : _b;
        _this.setVal("action", "getInfo");
        if (!_.isUndefined(uriOrUriList)) {
            _this.queryByUri(uriOrUriList);
        }
        _this.params = _.extend({}, _this.params, returnInfo.getParams("category"));
        return _this;
    }
    /**
     * search concepts by uri(s)
     */
    GetCategoryInfo.prototype.queryByUri = function (uriOrUriList) {
        this.setVal("uri", uriOrUriList);
    };
    /**
     * search concepts by id(s)
     */
    GetCategoryInfo.prototype.queryById = function (idOrIdList) {
        this.setVal("id", idOrIdList);
    };
    Object.defineProperty(GetCategoryInfo.prototype, "path", {
        get: function () {
            return "/json/category";
        },
        enumerable: true,
        configurable: true
    });
    return GetCategoryInfo;
}(base_1.QueryParamsBase));
exports.GetCategoryInfo = GetCategoryInfo;
/**
 * @class GetSourceStats
 * get stats about one or more sources - return json object will include:
 *  "uri"
 *  "id"
 *  "totalArticles" - total number of articles from this source
 *  "withStory" - number of articles assigned to a story (cluster)
 *  "duplicates" - number of articles that are duplicates of another article
 *  "duplicatesFromSameSource" - number of articles that are copies from articles
 *     from the same source (not true duplicates, just updates of own articles)
 *  "dailyCounts" - json object with date as the key and number of articles for that day as the value
 */
var GetSourceStats = /** @class */ (function (_super) {
    __extends(GetSourceStats, _super);
    function GetSourceStats(sourceUri) {
        var _this = _super.call(this) || this;
        _this.setVal("action", "getStats");
        if (sourceUri) {
            _this.setVal("uri", sourceUri);
        }
        return _this;
    }
    /**
     * get stats about one or more sources specified by their uris
     */
    GetSourceStats.prototype.queryByUri = function (uriOrUriList) {
        this.setVal("uri", uriOrUriList);
    };
    Object.defineProperty(GetSourceStats.prototype, "path", {
        get: function () {
            return "/json/source";
        },
        enumerable: true,
        configurable: true
    });
    return GetSourceStats;
}(base_1.QueryParamsBase));
exports.GetSourceStats = GetSourceStats;
