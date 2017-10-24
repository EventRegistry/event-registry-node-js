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
var TrendsBase = /** @class */ (function (_super) {
    __extends(TrendsBase, _super);
    function TrendsBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(TrendsBase.prototype, "path", {
        get: function () {
            return "/json/trends";
        },
        enumerable: true,
        configurable: true
    });
    return TrendsBase;
}(base_1.QueryParamsBase));
exports.TrendsBase = TrendsBase;
var GetTrendingConcepts = /** @class */ (function (_super) {
    __extends(GetTrendingConcepts, _super);
    function GetTrendingConcepts(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.source, source = _c === void 0 ? "news" : _c, _d = _b.count, count = _d === void 0 ? 20 : _d, _e = _b.conceptType, conceptType = _e === void 0 ? ["person", "org", "loc"] : _e, _f = _b.returnInfo, returnInfo = _f === void 0 ? new returnInfo_1.ReturnInfo() : _f;
        var _this = _super.call(this) || this;
        _this.setVal("action", "getTrendingConcepts");
        _this.setVal("source", source);
        _this.setVal("conceptCount", count);
        _this.setVal("conceptType", conceptType);
        _this.params = _.extend({}, _this.params, returnInfo.getParams());
        return _this;
    }
    return GetTrendingConcepts;
}(TrendsBase));
exports.GetTrendingConcepts = GetTrendingConcepts;
var GetTrendingCategories = /** @class */ (function (_super) {
    __extends(GetTrendingCategories, _super);
    function GetTrendingCategories(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.source, source = _c === void 0 ? "news" : _c, _d = _b.count, count = _d === void 0 ? 20 : _d, _e = _b.returnInfo, returnInfo = _e === void 0 ? new returnInfo_1.ReturnInfo() : _e;
        var _this = _super.call(this) || this;
        _this.setVal("action", "getTrendingCategories");
        _this.setVal("source", source);
        _this.setVal("categoryCount", count);
        _this.params = _.extend({}, _this.params, returnInfo.getParams());
        return _this;
    }
    return GetTrendingCategories;
}(TrendsBase));
exports.GetTrendingCategories = GetTrendingCategories;
var GetTrendingCustomItems = /** @class */ (function (_super) {
    __extends(GetTrendingCustomItems, _super);
    function GetTrendingCustomItems(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.count, count = _c === void 0 ? 20 : _c, _d = _b.returnInfo, returnInfo = _d === void 0 ? new returnInfo_1.ReturnInfo() : _d;
        var _this = _super.call(this) || this;
        _this.setVal("action", "getTrendingCustom");
        _this.setVal("conceptCount", count);
        _this.params = _.extend({}, _this.params, returnInfo.getParams());
        return _this;
    }
    return GetTrendingCustomItems;
}(TrendsBase));
exports.GetTrendingCustomItems = GetTrendingCustomItems;
var GetTrendingConceptGroups = /** @class */ (function (_super) {
    __extends(GetTrendingConceptGroups, _super);
    function GetTrendingConceptGroups(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.source, source = _c === void 0 ? "news" : _c, _d = _b.count, count = _d === void 0 ? 20 : _d, _e = _b.returnInfo, returnInfo = _e === void 0 ? new returnInfo_1.ReturnInfo() : _e;
        var _this = _super.call(this) || this;
        _this.setVal("action", "getConceptTrendGroups");
        _this.setVal("source", source);
        _this.setVal("conceptCount", count);
        _this.params = _.extend({}, _this.params, returnInfo.getParams());
        return _this;
    }
    GetTrendingConceptGroups.prototype.getConceptTypeGroups = function (types) {
        if (types === void 0) { types = ["person", "org", "loc"]; }
        this.setVal("conceptType", types);
    };
    GetTrendingConceptGroups.prototype.getConceptClassUris = function (conceptClassUris) {
        this.setVal("conceptClassUri", conceptClassUris);
    };
    return GetTrendingConceptGroups;
}(TrendsBase));
exports.GetTrendingConceptGroups = GetTrendingConceptGroups;
//# sourceMappingURL=trends.js.map