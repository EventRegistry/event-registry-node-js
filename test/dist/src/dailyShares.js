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
var moment = require("moment");
var base_1 = require("./base");
var returnInfo_1 = require("./returnInfo");
// Using the bottom classes you can obtain information about articles and events that
// were shared the most on social media (Twitter and Facebook) on a particular day.
// Given a date, articles published on that date are checked and top shared ones are returned.
// For an event, events on that day are checked and top shared ones are returned.
// Social score for an article is computed as the sum of shares on facebook and twitter.
// Social score for an event is computed by checking 30 top shared articles in the event and averaging their social scores.
var DailySharesBase = /** @class */ (function (_super) {
    __extends(DailySharesBase, _super);
    function DailySharesBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(DailySharesBase.prototype, "path", {
        get: function () {
            return "/json/topDailyShares";
        },
        enumerable: true,
        configurable: true
    });
    return DailySharesBase;
}(base_1.QueryParamsBase));
exports.DailySharesBase = DailySharesBase;
var GetTopSharedArticles = /** @class */ (function (_super) {
    __extends(GetTopSharedArticles, _super);
    function GetTopSharedArticles(args) {
        if (args === void 0) { args = {}; }
        var _this = this;
        var _a = args.date, date = _a === void 0 ? moment().format("YYYY-MM-DD") : _a, _b = args.count, count = _b === void 0 ? 20 : _b, _c = args.returnInfo, returnInfo = _c === void 0 ? new returnInfo_1.ReturnInfo() : _c;
        _this = _super.call(this) || this;
        _this.setVal("action", "getArticles");
        _this.setVal("count", count);
        _this.setDateVal("date", date);
        _this.params = _.extend({}, _this.params, returnInfo.getParams());
        return _this;
    }
    return GetTopSharedArticles;
}(DailySharesBase));
exports.GetTopSharedArticles = GetTopSharedArticles;
var GetTopSharedEvents = /** @class */ (function (_super) {
    __extends(GetTopSharedEvents, _super);
    function GetTopSharedEvents(args) {
        if (args === void 0) { args = {}; }
        var _this = this;
        var _a = args.date, date = _a === void 0 ? moment().format("YYYY-MM-DD") : _a, _b = args.count, count = _b === void 0 ? 20 : _b, _c = args.returnInfo, returnInfo = _c === void 0 ? new returnInfo_1.ReturnInfo() : _c;
        _this = _super.call(this) || this;
        _this.setVal("action", "getEvents");
        _this.setVal("count", count);
        _this.setDateVal("date", date);
        _this.params = _.extend({}, _this.params, returnInfo.getParams());
        return _this;
    }
    return GetTopSharedEvents;
}(DailySharesBase));
exports.GetTopSharedEvents = GetTopSharedEvents;
//# sourceMappingURL=dailyShares.js.map