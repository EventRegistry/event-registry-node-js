"use strict";
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var index_1 = require("../src/index");
var utils_1 = require("./utils");
describe("Query Event", function () {
    var er = utils_1.Utils.initAPI();
    var utils = new utils_1.Utils();
    var query;
    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
        var q, _a, _b, requestEventsUriList, response;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = index_1.QueryEvents.bind;
                    _b = { lang: "eng" };
                    return [4 /*yield*/, er.getConceptUri("Obama")];
                case 1:
                    q = new (_a.apply(index_1.QueryEvents, [void 0, (_b.conceptUri = _c.sent(), _b)]))();
                    requestEventsUriList = new index_1.RequestEventsUriList({ count: 10 });
                    q.setRequestedResult(requestEventsUriList);
                    return [4 /*yield*/, er.execQuery(q)];
                case 2:
                    response = _c.sent();
                    query = new index_1.QueryEvent(_.get(response, "uriList.results"));
                    return [2 /*return*/];
            }
        });
    }); });
    it("should test article list", function () { return __awaiter(_this, void 0, void 0, function () {
        var requestEventArticles, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    requestEventArticles = new index_1.RequestEventArticles({ returnInfo: utils.returnInfo });
                    query.setRequestedResult(requestEventArticles);
                    return [4 /*yield*/, er.execQuery(query)];
                case 1:
                    response = _a.sent();
                    _.each(response, function (event) {
                        _.each(_.get(event, "articles.results", []), function (article) {
                            expect(article).toBeValidArticle();
                        });
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it("should test article uris", function () { return __awaiter(_this, void 0, void 0, function () {
        var requestEventArticleUris, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    requestEventArticleUris = new index_1.RequestEventArticleUris();
                    query.setRequestedResult(requestEventArticleUris);
                    return [4 /*yield*/, er.execQuery(query)];
                case 1:
                    response = _a.sent();
                    _.each(response, function (event) {
                        expect(_.has(event, "articleUris")).toBeTruthy("Expected to see 'articleUris'");
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it("should test keywords", function () { return __awaiter(_this, void 0, void 0, function () {
        var requestEventKeywordAggr, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    requestEventKeywordAggr = new index_1.RequestEventKeywordAggr();
                    query.setRequestedResult(requestEventKeywordAggr);
                    return [4 /*yield*/, er.execQuery(query)];
                case 1:
                    response = _a.sent();
                    _.each(response, function (event) {
                        expect(_.has(event, "keywordAggr")).toBeTruthy("Expected to see 'keywordAggr'");
                        if (_.has(event, "keywordAggr.error")) {
                            console.error(_.get(event, "keywordAggr.error"));
                        }
                        _.each(_.get(event, "keywordAggr.results"), function (kw) {
                            expect(_.has(kw, "keyword")).toBeTruthy("Keyword expected");
                            expect(_.has(kw, "weight")).toBeTruthy("Weight expected");
                        });
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it("should test source aggregates", function () { return __awaiter(_this, void 0, void 0, function () {
        var requestEventSourceAggr, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    requestEventSourceAggr = new index_1.RequestEventSourceAggr();
                    query.setRequestedResult(requestEventSourceAggr);
                    return [4 /*yield*/, er.execQuery(query)];
                case 1:
                    response = _a.sent();
                    _.each(response, function (event) {
                        expect(_.has(event, "sourceExAggr")).toBeTruthy("Expected to see 'sourceExAggr'");
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it("should test article trends", function () { return __awaiter(_this, void 0, void 0, function () {
        var requestEventArticleTrend, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    requestEventArticleTrend = new index_1.RequestEventArticleTrend();
                    query.setRequestedResult(requestEventArticleTrend);
                    return [4 /*yield*/, er.execQuery(query)];
                case 1:
                    response = _a.sent();
                    _.each(response, function (event) {
                        expect(_.has(event, "articleTrend")).toBeTruthy("Expected to see 'articleTrend'");
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it("should test similar events", function () { return __awaiter(_this, void 0, void 0, function () {
        var requestEventSimilarEvents, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    requestEventSimilarEvents = new index_1.RequestEventSimilarEvents({ addArticleTrendInfo: true, returnInfo: utils.returnInfo });
                    query.setRequestedResult(requestEventSimilarEvents);
                    return [4 /*yield*/, er.execQuery(query)];
                case 1:
                    response = _a.sent();
                    _.each(response, function (event) {
                        expect(_.has(event, "similarEvents")).toBeTruthy("Expected to see 'similarEvents'");
                        _.each(_.get(event, "similarEvents.results"), function (simEvent) {
                            expect(simEvent).toBeValidEvent();
                        });
                        expect(_.has(event, "similarEvents.trends")).toBeTruthy("Expected to see 'trends'");
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it("should test similar stories", function () { return __awaiter(_this, void 0, void 0, function () {
        var requestEventSimilarStories, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    requestEventSimilarStories = new index_1.RequestEventSimilarStories({ returnInfo: utils.returnInfo });
                    query.setRequestedResult(requestEventSimilarStories);
                    return [4 /*yield*/, er.execQuery(query)];
                case 1:
                    response = _a.sent();
                    _.each(response, function (event) {
                        expect(_.has(event, "similarStories")).toBeTruthy("Expected to see 'similarStories'");
                        _.each(_.get(event, "similarStories.results"), function (simStory) {
                            expect(simStory).toBeValidStory();
                        });
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    // TODO: use a an event uri that actually exists in the database
    it("should test query event articles iterator", function (done) { return __awaiter(_this, void 0, void 0, function () {
        var _this = this;
        var q, size;
        return __generator(this, function (_a) {
            q = new index_1.QueryEventArticlesIter(er, "eng-2863607");
            size = 0;
            q.execQuery(function (items) {
                size += _.size(items);
            }, function () { return __awaiter(_this, void 0, void 0, function () {
                var q2, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            q2 = new index_1.QueryEvent("eng-2863607");
                            return [4 /*yield*/, er.execQuery(q2)];
                        case 1:
                            response = _a.sent();
                            expect(_.get(response["eng-2863607"], "info.totalArticleCount")).toEqual(size);
                            done();
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
});
//# sourceMappingURL=queryEvent.spec.js.map