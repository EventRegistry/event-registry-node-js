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
describe("Query Articles Complex", function () {
    var er = utils_1.Utils.initAPI();
    var utils = new utils_1.Utils();
    it("should test keywords (1)", function (done) {
        var baseQuery = new index_1.BaseQuery({ keyword: "obama", keywordLoc: "title" });
        var cq1 = new index_1.ComplexArticleQuery(baseQuery);
        var queryArticlesIter = new index_1.QueryArticlesIter(er);
        var artIter = index_1.QueryArticlesIter.initWithComplexQuery(queryArticlesIter, cq1);
        artIter.execQuery(function (items) {
            _.each(items, function (item) {
                expect(_.deburr(_.toLower(_.get(item, "title")))).toContain("obama");
            });
        }, function () {
            done();
        });
    });
    it("should test keywords (2)", function (done) {
        var qStr = "\n        {\n            \"$query\": {\n                \"keyword\": \"obama\", \"keywordLoc\": \"title\"\n            }\n        }\n        ";
        var queryArticlesIter = new index_1.QueryArticlesIter(er);
        var artIter = index_1.QueryArticlesIter.initWithComplexQuery(queryArticlesIter, qStr);
        artIter.execQuery(function (items) {
            _.each(items, function (item) {
                expect(_.deburr(_.toLower(_.get(item, "title")))).toContain("obama");
            });
        }, function () {
            done();
        });
    });
    it("should test keywords (3)", function (done) {
        var baseQuery = new index_1.BaseQuery({ keyword: "home", keywordLoc: "body" });
        var cq1 = new index_1.ComplexArticleQuery(baseQuery);
        var queryArticlesIter = new index_1.QueryArticlesIter(er, { returnInfo: utils.returnInfo, maxItems: 10 });
        var artIter = index_1.QueryArticlesIter.initWithComplexQuery(queryArticlesIter, cq1);
        artIter.execQuery(function (items, error) {
            _.each(items, function (item) {
                expect(_.deburr(_.toLower(_.get(item, "body")))).toContain("home");
            });
        }, function () {
            done();
        });
    });
    it("should compare same results from keyword search (1)", function () { return __awaiter(_this, void 0, void 0, function () {
        var exclude, baseQuery1, cq1, combinedQuery, cq2, q, listRes1, listRes2, listRes3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    exclude = new index_1.BaseQuery({ lang: index_1.QueryItems.OR(["eng", "deu"]) });
                    baseQuery1 = new index_1.BaseQuery({ keyword: index_1.QueryItems.AND(["obama", "trump"]), exclude: exclude });
                    cq1 = new index_1.ComplexArticleQuery(baseQuery1);
                    combinedQuery = index_1.CombinedQuery.AND([new index_1.BaseQuery({ keyword: "obama" }), new index_1.BaseQuery({ keyword: "trump" })], exclude);
                    cq2 = new index_1.ComplexArticleQuery(combinedQuery);
                    q = new index_1.QueryArticles({ keywords: index_1.QueryItems.AND(["obama", "trump"]), ignoreLang: ["eng", "deu"] });
                    return [4 /*yield*/, utils.getArticlesQueryUriListForComplexQuery(er, new index_1.QueryArticles(), cq1)];
                case 1:
                    listRes1 = _a.sent();
                    return [4 /*yield*/, utils.getArticlesQueryUriListForComplexQuery(er, new index_1.QueryArticles(), cq2)];
                case 2:
                    listRes2 = _a.sent();
                    return [4 /*yield*/, utils.getQueryUriListForQueryArticles(er, q)];
                case 3:
                    listRes3 = _a.sent();
                    expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes2, "totalResults"));
                    expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes3, "totalResults"));
                    return [2 /*return*/];
            }
        });
    }); });
    it("should compare same results from keyword search (2)", function () { return __awaiter(_this, void 0, void 0, function () {
        var obamaUri, bbcUri, apUri, exclude, baseQuery1, cq1, combinedQuery, cq2, q, listRes1, listRes2, listRes3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, er.getConceptUri("obama")];
                case 1:
                    obamaUri = _a.sent();
                    return [4 /*yield*/, er.getNewsSourceUri("bbc")];
                case 2:
                    bbcUri = _a.sent();
                    return [4 /*yield*/, er.getNewsSourceUri("associated press")];
                case 3:
                    apUri = _a.sent();
                    exclude = new index_1.BaseQuery({ conceptUri: index_1.QueryItems.OR([obamaUri]) });
                    baseQuery1 = new index_1.BaseQuery({ sourceUri: index_1.QueryItems.OR([bbcUri, apUri]), exclude: exclude });
                    cq1 = new index_1.ComplexArticleQuery(baseQuery1);
                    combinedQuery = index_1.CombinedQuery.OR([
                        new index_1.BaseQuery({ sourceUri: bbcUri }),
                        new index_1.BaseQuery({ sourceUri: apUri }),
                    ], exclude);
                    cq2 = new index_1.ComplexArticleQuery(combinedQuery);
                    q = new index_1.QueryArticles({ sourceUri: [bbcUri, apUri], ignoreConceptUri: obamaUri });
                    return [4 /*yield*/, utils.getArticlesQueryUriListForComplexQuery(er, new index_1.QueryArticles(), cq1)];
                case 4:
                    listRes1 = _a.sent();
                    return [4 /*yield*/, utils.getArticlesQueryUriListForComplexQuery(er, new index_1.QueryArticles(), cq2)];
                case 5:
                    listRes2 = _a.sent();
                    return [4 /*yield*/, utils.getQueryUriListForQueryArticles(er, q)];
                case 6:
                    listRes3 = _a.sent();
                    expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes2, "totalResults"));
                    expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes3, "totalResults"));
                    return [2 /*return*/];
            }
        });
    }); });
    it("should compare same results from keyword search (3)", function () { return __awaiter(_this, void 0, void 0, function () {
        var exclude, _a, _b, baseQuery1, cq1, combinedQuery, cq2, q, _c, _d, listRes1, listRes2, listRes3;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _a = index_1.BaseQuery.bind;
                    _b = {};
                    return [4 /*yield*/, er.getCategoryUri("Business")];
                case 1:
                    exclude = new (_a.apply(index_1.BaseQuery, [void 0, (_b.categoryUri = _e.sent(), _b)]))();
                    baseQuery1 = new index_1.BaseQuery({ dateStart: "2017-02-05", dateEnd: "2017-02-06", exclude: exclude });
                    cq1 = new index_1.ComplexArticleQuery(baseQuery1);
                    combinedQuery = index_1.CombinedQuery.AND([
                        new index_1.BaseQuery({ dateStart: "2017-02-05" }),
                        new index_1.BaseQuery({ dateEnd: "2017-02-06" }),
                    ], exclude);
                    cq2 = new index_1.ComplexArticleQuery(combinedQuery);
                    _c = index_1.QueryArticles.bind;
                    _d = { dateStart: "2017-02-05", dateEnd: "2017-02-06" };
                    return [4 /*yield*/, er.getCategoryUri("business")];
                case 2:
                    q = new (_c.apply(index_1.QueryArticles, [void 0, (_d.ignoreCategoryUri = _e.sent(), _d)]))();
                    return [4 /*yield*/, utils.getArticlesQueryUriListForComplexQuery(er, new index_1.QueryArticles(), cq1)];
                case 3:
                    listRes1 = _e.sent();
                    return [4 /*yield*/, utils.getArticlesQueryUriListForComplexQuery(er, new index_1.QueryArticles(), cq2)];
                case 4:
                    listRes2 = _e.sent();
                    return [4 /*yield*/, utils.getQueryUriListForQueryArticles(er, q)];
                case 5:
                    listRes3 = _e.sent();
                    expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes2, "totalResults"));
                    expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes3, "totalResults"));
                    return [2 /*return*/];
            }
        });
    }); });
    it("should compare same results from keyword search (4)", function () { return __awaiter(_this, void 0, void 0, function () {
        var businessUri, qStr, q1, q, listRes1, listRes2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, er.getCategoryUri("Business")];
                case 1:
                    businessUri = _a.sent();
                    qStr = "\n        {\n            \"$query\": {\n                \"dateStart\": \"2017-02-05\", \"dateEnd\": \"2017-02-06\",\n                \"$not\": {\n                    \"categoryUri\": \"" + businessUri + "\"\n                }\n            }\n        }\n        ";
                    q1 = index_1.QueryArticles.initWithComplexQuery(new index_1.QueryArticles(), qStr);
                    q = new index_1.QueryArticles({ dateStart: "2017-02-05", dateEnd: "2017-02-06", ignoreCategoryUri: businessUri });
                    return [4 /*yield*/, utils.getQueryUriListForQueryArticles(er, q1)];
                case 2:
                    listRes1 = _a.sent();
                    return [4 /*yield*/, utils.getQueryUriListForQueryArticles(er, q)];
                case 3:
                    listRes2 = _a.sent();
                    expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes2, "totalResults"));
                    return [2 /*return*/];
            }
        });
    }); });
    it("should compare same results from keyword search (5)", function () { return __awaiter(_this, void 0, void 0, function () {
        var trumpUri, obamaUri, politicsUri, qStr, q1, cq2, listRes1, listRes2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, er.getConceptUri("Trump")];
                case 1:
                    trumpUri = _a.sent();
                    return [4 /*yield*/, er.getConceptUri("Obama")];
                case 2:
                    obamaUri = _a.sent();
                    return [4 /*yield*/, er.getCategoryUri("politics")];
                case 3:
                    politicsUri = _a.sent();
                    qStr = "\n        {\n            \"$query\": {\n                \"$or\": [\n                    { \"dateStart\": \"2017-02-05\", \"dateEnd\": \"2017-02-05\" },\n                    { \"conceptUri\": \"" + trumpUri + "\" },\n                    { \"categoryUri\": \"" + politicsUri + "\" }\n                ],\n                \"$not\": {\n                    \"$or\": [\n                        { \"dateStart\": \"2017-02-04\", \"dateEnd\": \"2017-02-04\" },\n                        { \"conceptUri\": \"" + obamaUri + "\" }\n                    ]\n                }\n            }\n        }\n        ";
                    q1 = index_1.QueryArticles.initWithComplexQuery(new index_1.QueryArticles(), qStr);
                    cq2 = new index_1.ComplexArticleQuery(index_1.CombinedQuery.OR([
                        new index_1.BaseQuery({ dateStart: "2017-02-05", dateEnd: "2017-02-05" }),
                        new index_1.BaseQuery({ conceptUri: trumpUri }),
                        new index_1.BaseQuery({ categoryUri: politicsUri }),
                    ], index_1.CombinedQuery.OR([
                        new index_1.BaseQuery({ dateStart: "2017-02-04", dateEnd: "2017-02-04" }),
                        new index_1.BaseQuery({ conceptUri: obamaUri }),
                    ])));
                    return [4 /*yield*/, utils.getQueryUriListForQueryArticles(er, q1)];
                case 4:
                    listRes1 = _a.sent();
                    return [4 /*yield*/, utils.getArticlesQueryUriListForComplexQuery(er, new index_1.QueryArticles(), cq2)];
                case 5:
                    listRes2 = _a.sent();
                    expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes2, "totalResults"));
                    return [2 /*return*/];
            }
        });
    }); });
    it("should compare same results from keyword search (6)", function () { return __awaiter(_this, void 0, void 0, function () {
        var trumpUri, obamaUri, politicsUri, merkelUri, businessUri, qStr, q1, cq2, listRes1, listRes2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, er.getConceptUri("Trump")];
                case 1:
                    trumpUri = _a.sent();
                    return [4 /*yield*/, er.getConceptUri("Obama")];
                case 2:
                    obamaUri = _a.sent();
                    return [4 /*yield*/, er.getCategoryUri("politics")];
                case 3:
                    politicsUri = _a.sent();
                    return [4 /*yield*/, er.getConceptUri("merkel")];
                case 4:
                    merkelUri = _a.sent();
                    return [4 /*yield*/, er.getCategoryUri("business")];
                case 5:
                    businessUri = _a.sent();
                    qStr = "\n        {\n            \"$query\": {\n                \"$or\": [\n                    { \"dateStart\": \"2017-02-05\", \"dateEnd\": \"2017-02-05\" },\n                    { \"dateStart\": \"2017-02-04\", \"dateEnd\": \"2017-02-04\" },\n                    { \"conceptUri\": \"" + trumpUri + "\" },\n                    { \"categoryUri\": \"" + politicsUri + "\" },\n                    {\n                        \"$and\": [\n                            { \"conceptUri\": \"" + merkelUri + "\" },\n                            { \"categoryUri\": \"" + businessUri + "\" }\n                        ]\n                    }\n                ],\n                \"$not\": {\n                    \"$or\": [\n                        { \"dateStart\": \"2017-02-04\", \"dateEnd\": \"2017-02-04\" },\n                        { \"conceptUri\": \"" + obamaUri + "\" }\n                    ]\n                }\n            }\n        }\n        ";
                    q1 = index_1.QueryArticles.initWithComplexQuery(new index_1.QueryArticles(), qStr);
                    cq2 = new index_1.ComplexArticleQuery(index_1.CombinedQuery.OR([
                        new index_1.BaseQuery({ dateStart: "2017-02-04", dateEnd: "2017-02-05" }),
                        new index_1.BaseQuery({ conceptUri: trumpUri }),
                        new index_1.BaseQuery({ categoryUri: politicsUri }),
                        index_1.CombinedQuery.AND([
                            new index_1.BaseQuery({ conceptUri: merkelUri }),
                            new index_1.BaseQuery({ categoryUri: businessUri }),
                        ]),
                    ], index_1.CombinedQuery.OR([
                        new index_1.BaseQuery({ dateStart: "2017-02-04", dateEnd: "2017-02-04" }),
                        new index_1.BaseQuery({ conceptUri: obamaUri }),
                    ])));
                    return [4 /*yield*/, utils.getQueryUriListForQueryArticles(er, q1)];
                case 6:
                    listRes1 = _a.sent();
                    return [4 /*yield*/, utils.getArticlesQueryUriListForComplexQuery(er, new index_1.QueryArticles(), cq2)];
                case 7:
                    listRes2 = _a.sent();
                    expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes2, "totalResults"));
                    return [2 /*return*/];
            }
        });
    }); });
    it("should get valid content", function (done) { return __awaiter(_this, void 0, void 0, function () {
        var trumpUri, obamaUri, politicsUri, cq, returnInfo, queryArticlesIter, artIter;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, er.getConceptUri("Trump")];
                case 1:
                    trumpUri = _a.sent();
                    return [4 /*yield*/, er.getConceptUri("Obama")];
                case 2:
                    obamaUri = _a.sent();
                    return [4 /*yield*/, er.getCategoryUri("politics")];
                case 3:
                    politicsUri = _a.sent();
                    cq = new index_1.ComplexArticleQuery(index_1.CombinedQuery.OR([
                        new index_1.BaseQuery({ dateStart: "2017-02-04", dateEnd: "2017-02-05" }),
                        new index_1.BaseQuery({ conceptUri: trumpUri }),
                        new index_1.BaseQuery({ categoryUri: politicsUri }),
                    ], index_1.CombinedQuery.OR([
                        new index_1.BaseQuery({ dateStart: "2017-02-04", dateEnd: "2017-02-04" }),
                        new index_1.BaseQuery({ conceptUri: obamaUri }),
                    ])));
                    returnInfo = new index_1.ReturnInfo({ articleInfo: new index_1.ArticleInfoFlags({ concepts: true, categories: true }) });
                    queryArticlesIter = new index_1.QueryArticlesIter(er, { returnInfo: returnInfo, maxItems: 50 });
                    artIter = index_1.QueryArticlesIter.initWithComplexQuery(queryArticlesIter, cq);
                    artIter.execQuery(function (items) {
                        _.each(items, function (item) {
                            var hasConcept = _.find(_.get(item, "concepts", []), function (_a) {
                                var uri = _a.uri;
                                return uri === trumpUri;
                            });
                            var hasCategory = _.find(_.get(item, "categories", []), function (_a) {
                                var uri = _a.uri;
                                return _.includes(uri, politicsUri);
                            });
                            var hasDate = _.get(item, "date") === "2017-02-05";
                            expect(hasConcept || hasCategory || hasDate).toBeTruthy("Invalid article " + item.uri + " that should not be in the results.");
                            _.each(_.get(item, "concepts", []), function (_a) {
                                var uri = _a.uri;
                                expect(uri).not.toEqual(obamaUri);
                            });
                            expect(_.get(item, "date")).not.toEqual("2017-02-04");
                        });
                    }, function () {
                        done();
                    });
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=queryArticlesComplex.spec.js.map