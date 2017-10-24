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
var returnInfo_1 = require("./returnInfo");
var GetRecentEvents = /** @class */ (function (_super) {
    __extends(GetRecentEvents, _super);
    function GetRecentEvents(er, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.mandatoryLang, mandatoryLang = _c === void 0 ? undefined : _c, _d = _b.mandatoryLocation, mandatoryLocation = _d === void 0 ? true : _d, _e = _b.returnInfo, returnInfo = _e === void 0 ? new returnInfo_1.ReturnInfo() : _e;
        var _this = _super.call(this) || this;
        _this.er = er;
        _this.setVal("recentActivityEventsMandatoryLocation", mandatoryLocation);
        if (!_.isUndefined(mandatoryLang)) {
            _this.setVal("recentActivityEventsMandatoryLang", mandatoryLang);
        }
        _this.params = _.extend({}, _this.params, returnInfo.getParams("recentActivityEvents"));
        return _this;
    }
    Object.defineProperty(GetRecentEvents.prototype, "path", {
        get: function () {
            return "/json/minuteStreamEvents";
        },
        enumerable: true,
        configurable: true
    });
    GetRecentEvents.prototype.getUpdates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.er.execQuery(this)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, _.get(response, "recentActivity.events", {})];
                }
            });
        });
    };
    return GetRecentEvents;
}(base_1.QueryParamsBase));
exports.GetRecentEvents = GetRecentEvents;
var GetRecentArticles = /** @class */ (function (_super) {
    __extends(GetRecentArticles, _super);
    function GetRecentArticles(er, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.mandatorySourceLocation, mandatorySourceLocation = _c === void 0 ? undefined : _c, _d = _b.articleLang, articleLang = _d === void 0 ? true : _d, _e = _b.returnInfo, returnInfo = _e === void 0 ? new returnInfo_1.ReturnInfo() : _e;
        var _this = _super.call(this) || this;
        _this.er = er;
        _this.setVal("recentActivityArticlesMandatorySourceLocation", mandatorySourceLocation);
        if (!_.isUndefined(articleLang)) {
            _this.setVal("recentActivityArticlesLang", articleLang);
        }
        _this.params = _.extend({}, _this.params, returnInfo.getParams("recentActivityArticles"));
        return _this;
    }
    Object.defineProperty(GetRecentArticles.prototype, "path", {
        get: function () {
            return "/json/minuteStreamArticles";
        },
        enumerable: true,
        configurable: true
    });
    GetRecentArticles.prototype.getUpdates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.er.execQuery(this)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, _.get(response, "recentActivity.articles.activity", [])];
                }
            });
        });
    };
    return GetRecentArticles;
}(base_1.QueryParamsBase));
exports.GetRecentArticles = GetRecentArticles;
