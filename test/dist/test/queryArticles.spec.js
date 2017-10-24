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
describe("Query Articles", function () {
    var er = utils_1.Utils.initAPI();
    var utils = new utils_1.Utils();
    var query;
    var requestArticlesInfo;
    beforeAll(function (done) { return __awaiter(_this, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = index_1.QueryArticles.bind;
                    _b = {};
                    return [4 /*yield*/, er.getConceptUri("Obama")];
                case 1:
                    query = new (_a.apply(index_1.QueryArticles, [void 0, (_b.conceptUri = _c.sent(), _b)]))();
                    requestArticlesInfo = new index_1.RequestArticlesInfo({ count: 30, returnInfo: utils.returnInfo });
                    done();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return list of articles", function (done) { return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query.setRequestedResult(requestArticlesInfo);
                    return [4 /*yield*/, er.execQuery(query)];
                case 1:
                    response = _a.sent();
                    expect(response).toBeValidGeneralArticleList();
                    done();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return list of articles with keyword search", function (done) { return __awaiter(_this, void 0, void 0, function () {
        var q1, res1, q2, res2, results1, results2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    q1 = new index_1.QueryArticles({ keywords: "iphone" });
                    q1.setRequestedResult(requestArticlesInfo);
                    return [4 /*yield*/, er.execQuery(q1)];
                case 1:
                    res1 = _a.sent();
                    expect(res1).toBeValidGeneralArticleList();
                    q2 = new index_1.QueryArticles({ keywords: "iphone" });
                    q2.setRequestedResult(requestArticlesInfo);
                    return [4 /*yield*/, er.execQuery(q2)];
                case 2:
                    res2 = _a.sent();
                    expect(res2).toBeValidGeneralArticleList();
                    results1 = _.sortBy(res1["articles"]["results"], "id");
                    results2 = _.sortBy(res2["articles"]["results"], "id");
                    expect(_.size(results1)).toEqual(_.size(results2), "Keyword search should return responses of the same size");
                    done();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return list of articles with keyword title search ('iphone')", function (done) {
        var q = new index_1.QueryArticlesIter(er, { keywords: "iphone", keywordsLoc: "title", returnInfo: utils.returnInfo, maxItems: 50, articleBatchSize: 10 });
        q.execQuery(function (items, errorMessage) {
            if (errorMessage) {
                console.error(errorMessage);
                done();
            }
            _.each(items, function (item) {
                expect(_.toLower(_.get(item, "title"))).toContain("iphone");
            });
        }, function () {
            done();
        });
    });
    it("should return list of articles with keyword title search ('home')", function (done) {
        var q = new index_1.QueryArticlesIter(er, { keywords: "home", keywordsLoc: "title", returnInfo: utils.returnInfo, maxItems: 50, articleBatchSize: 10 });
        q.execQuery(function (items, errorMessage) {
            if (errorMessage) {
                console.error(errorMessage);
                done();
            }
            _.each(items, function (item) {
                expect(_.toLower(_.get(item, "title"))).toContain("home");
            });
        }, function () {
            done();
        });
    });
    it("should return list of articles with keyword body search ('home')", function (done) {
        var q = new index_1.QueryArticlesIter(er, { keywords: "home", keywordsLoc: "body", returnInfo: utils.returnInfo, maxItems: 50, articleBatchSize: 10 });
        q.execQuery(function (items, errorMessage) {
            if (errorMessage) {
                console.error(errorMessage);
                done();
            }
            _.each(items, function (item) {
                expect(item).toContainBodyText("home");
            });
        }, function () {
            done();
        });
    });
    it("should return list of articles with keyword body search ('jack')", function (done) {
        var q = new index_1.QueryArticlesIter(er, { keywords: "jack", keywordsLoc: "body", returnInfo: utils.returnInfo, maxItems: 50, articleBatchSize: 10 });
        q.execQuery(function (items, errorMessage) {
            if (errorMessage) {
                console.error(errorMessage);
                done();
            }
            _.each(items, function (item) {
                expect(item).toContainBodyText("jack");
            });
        }, function () {
            done();
        });
    });
    it("should return list with publisher search", function (done) { return __awaiter(_this, void 0, void 0, function () {
        var sourceUri, q1, res1, q2, res2, results1, results2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, er.getNewsSourceUri("bbc")];
                case 1:
                    sourceUri = _a.sent();
                    q1 = new index_1.QueryArticles({ sourceUri: sourceUri });
                    q1.setRequestedResult(requestArticlesInfo);
                    return [4 /*yield*/, er.execQuery(q1)];
                case 2:
                    res1 = _a.sent();
                    expect(res1).toBeValidGeneralArticleList();
                    _.each(_.get(res1, "articles.results"), function (article) {
                        expect(_.get(article, "source.uri")).toBe(sourceUri, "Article is not from the specified source");
                    });
                    q2 = new index_1.QueryArticles({ sourceUri: sourceUri });
                    q2.setRequestedResult(requestArticlesInfo);
                    return [4 /*yield*/, er.execQuery(q2)];
                case 3:
                    res2 = _a.sent();
                    expect(res2).toBeValidGeneralArticleList();
                    results1 = _.sortBy(res1["articles"]["results"], "id");
                    results2 = _.sortBy(res2["articles"]["results"], "id");
                    expect(_.size(results1)).toEqual(_.size(results2), "Publisher search should return responses of the same size");
                    expect(_.map(results1, "id")).toEqual(_.map(results2, "id"), "Publisher search should return equal responses");
                    done();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return list with category search", function () { return __awaiter(_this, void 0, void 0, function () {
        var categoryUri, q1, res1, q2, res2, results1, results2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, er.getCategoryUri("disa")];
                case 1:
                    categoryUri = _a.sent();
                    q1 = new index_1.QueryArticles({ categoryUri: categoryUri });
                    q1.setRequestedResult(requestArticlesInfo);
                    return [4 /*yield*/, er.execQuery(q1)];
                case 2:
                    res1 = _a.sent();
                    expect(res1).toBeValidGeneralArticleList();
                    q2 = new index_1.QueryArticles({ categoryUri: categoryUri });
                    q2.setRequestedResult(requestArticlesInfo);
                    return [4 /*yield*/, er.execQuery(q2)];
                case 3:
                    res2 = _a.sent();
                    expect(res2).toBeValidGeneralArticleList();
                    results1 = _.sortBy(res1["articles"]["results"], "id");
                    results2 = _.sortBy(res2["articles"]["results"], "id");
                    expect(_.size(results1)).toEqual(_.size(results2), "Category search should return responses of the same size");
                    expect(_.map(results1, "id")).toEqual(_.map(results2, "id"), "Category search should return equal responses");
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return list with lang search", function (done) { return __awaiter(_this, void 0, void 0, function () {
        var q1, res1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    q1 = new index_1.QueryArticles({ lang: "deu" });
                    q1.setRequestedResult(requestArticlesInfo);
                    return [4 /*yield*/, er.execQuery(q1)];
                case 1:
                    res1 = _a.sent();
                    expect(res1).toBeValidGeneralArticleList();
                    _.each(_.get(res1, "articles.results"), function (article) {
                        expect(_.get(article, "lang")).toBe("deu", "Article is not in the specified language");
                    });
                    done();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return list with location search", function (done) { return __awaiter(_this, void 0, void 0, function () {
        var locationUri, q1, res1, q2, res2, results1, results2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, er.getLocationUri("united")];
                case 1:
                    locationUri = _a.sent();
                    q1 = new index_1.QueryArticles({ locationUri: locationUri });
                    q1.setRequestedResult(requestArticlesInfo);
                    return [4 /*yield*/, er.execQuery(q1)];
                case 2:
                    res1 = _a.sent();
                    expect(res1).toBeValidGeneralArticleList();
                    q2 = new index_1.QueryArticles({ locationUri: locationUri });
                    q2.setRequestedResult(requestArticlesInfo);
                    return [4 /*yield*/, er.execQuery(q2)];
                case 3:
                    res2 = _a.sent();
                    expect(res2).toBeValidGeneralArticleList();
                    results1 = _.sortBy(res1["articles"]["results"], "id");
                    results2 = _.sortBy(res2["articles"]["results"], "id");
                    expect(_.size(results1)).toEqual(_.size(results2), "Location search should return responses of the same size");
                    expect(_.map(results1, "id")).toEqual(_.map(results2, "id"), "Location search should return equal responses");
                    done();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return list with combined search", function (done) { return __awaiter(_this, void 0, void 0, function () {
        var keywords, lang, conceptUri, categoryUri, q1, res1, q2, res2, results1, results2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    keywords = "germany";
                    lang = ["eng", "deu"];
                    return [4 /*yield*/, er.getConceptUri("Merkel")];
                case 1:
                    conceptUri = _a.sent();
                    return [4 /*yield*/, er.getCategoryUri("Business")];
                case 2:
                    categoryUri = _a.sent();
                    q1 = new index_1.QueryArticles({ keywords: keywords, lang: lang, conceptUri: conceptUri, categoryUri: categoryUri });
                    q1.setRequestedResult(requestArticlesInfo);
                    return [4 /*yield*/, er.execQuery(q1)];
                case 3:
                    res1 = _a.sent();
                    expect(res1).toBeValidGeneralArticleList();
                    q2 = new index_1.QueryArticles({ keywords: keywords, lang: lang, conceptUri: conceptUri, categoryUri: categoryUri });
                    q2.setRequestedResult(requestArticlesInfo);
                    return [4 /*yield*/, er.execQuery(q2)];
                case 4:
                    res2 = _a.sent();
                    expect(res2).toBeValidGeneralArticleList();
                    results1 = _.sortBy(res1["articles"]["results"], "id");
                    results2 = _.sortBy(res2["articles"]["results"], "id");
                    expect(_.size(results1)).toEqual(_.size(results2), "Combined search should return responses of the same size");
                    expect(_.map(results1, "id")).toEqual(_.map(results2, "id"), "Combined search should return equal responses");
                    done();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return list of concept trends", function (done) { return __awaiter(_this, void 0, void 0, function () {
        var requestArticlesConceptTrends, response, trends;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    requestArticlesConceptTrends = new index_1.RequestArticlesConceptTrends({ count: 5, returnInfo: utils.returnInfo });
                    query.setRequestedResult(requestArticlesConceptTrends);
                    return [4 /*yield*/, er.execQuery(query)];
                case 1:
                    response = _a.sent();
                    // Check that we get the expected properties
                    expect(_.has(response, "conceptTrends")).toBeTruthy("Expected to get 'conceptTrends'");
                    expect(_.has(response, "conceptTrends.trends")).toBeTruthy("Expected to get 'trends' property in conceptTrends");
                    expect(_.has(response, "conceptTrends.conceptInfo")).toBeTruthy("Expected to get 'conceptInfo' property in conceptTrends");
                    expect(_.size(_.get(response, "conceptTrends.conceptInfo"))).toBe(5, "Expected to get 5 concepts in concept trends");
                    trends = _.get(response, "conceptTrends.trends");
                    expect(!_.isEmpty(trends)).toBeTruthy();
                    _.each(trends, function (trend) {
                        expect(_.has(trend, "date")).toBeTruthy("A trend should have a date");
                        expect(_.has(trend, "conceptFreq")).toBeTruthy("A trend should have a conceptFreq");
                        expect(_.has(trend, "totArts")).toBeTruthy("A trend should have a totArts property");
                        expect(_.size(_.get(trend, "conceptFreq"))).toBeLessThanOrEqual(5, "Concept frequencies should contain 5 elements - one for each concept");
                    });
                    _.each(_.get(response, "conceptTrends.conceptInfo"), function (concept) {
                        expect(concept).toBeValidConcept();
                    });
                    done();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return aggregate of concepts of resulting articles", function (done) { return __awaiter(_this, void 0, void 0, function () {
        var requestArticlesConceptAggr, response, concepts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    requestArticlesConceptAggr = new index_1.RequestArticlesConceptAggr({ conceptCount: 50, returnInfo: utils.returnInfo });
                    query.setRequestedResult(requestArticlesConceptAggr);
                    return [4 /*yield*/, er.execQuery(query)];
                case 1:
                    response = _a.sent();
                    expect(_.has(response, "conceptAggr")).toBeTruthy("Expected to get 'conceptAggr'");
                    concepts = _.get(response, "conceptAggr.results");
                    expect(_.size(concepts)).toEqual(50, "Expected a different number of concepts in 'conceptAggr'");
                    _.each(concepts, function (concept) {
                        expect(concept).toBeValidConcept();
                    });
                    done();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return aggregate of keywords of resulting articles", function (done) { return __awaiter(_this, void 0, void 0, function () {
        var requestArticlesKeywordAggr, response, keywords;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    requestArticlesKeywordAggr = new index_1.RequestArticlesKeywordAggr();
                    query.setRequestedResult(requestArticlesKeywordAggr);
                    return [4 /*yield*/, er.execQuery(query)];
                case 1:
                    response = _a.sent();
                    expect(_.has(response, "keywordAggr")).toBeTruthy("Expected to get 'keywordAggr'");
                    keywords = _.get(response, "keywordAggr.results", []);
                    expect(_.size(keywords)).toBeGreaterThan(0, "Expected to get some keywords");
                    _.each(keywords, function (keyword) {
                        expect(_.has(keyword, "keyword")).toBeTruthy("Expected a keyword property");
                        expect(_.has(keyword, "weight")).toBeTruthy("Expected a weight property");
                    });
                    done();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return aggregate of categories of resulting articles", function (done) { return __awaiter(_this, void 0, void 0, function () {
        var requestArticlesCategoryAggr, response, categories;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    requestArticlesCategoryAggr = new index_1.RequestArticlesCategoryAggr({ returnInfo: utils.returnInfo });
                    query.setRequestedResult(requestArticlesCategoryAggr);
                    return [4 /*yield*/, er.execQuery(query)];
                case 1:
                    response = _a.sent();
                    expect(_.has(response, "categoryAggr")).toBeTruthy("Expected to get 'categoryAggr'");
                    categories = _.get(response, "categoryAggr.results", []);
                    expect(_.size(categories)).toBeGreaterThan(0, "Expected to get a non empty category aggregates");
                    _.each(categories, function (category) {
                        expect(category).toBeValidCategory();
                    });
                    done();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return concept matrix of resulting articles", function (done) { return __awaiter(_this, void 0, void 0, function () {
        var requestArticlesConceptMatrix, response, matrix;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    requestArticlesConceptMatrix = new index_1.RequestArticlesConceptMatrix({ conceptCount: 20, returnInfo: utils.returnInfo });
                    query.setRequestedResult(requestArticlesConceptMatrix);
                    return [4 /*yield*/, er.execQuery(query)];
                case 1:
                    response = _a.sent();
                    expect(_.has(response, "conceptMatrix")).toBeTruthy("Expected to get 'conceptMatrix'");
                    matrix = _.get(response, "conceptMatrix");
                    expect(_.has(matrix, "sampleSize")).toBeTruthy("Expecting 'sampleSize' property in conceptMatrix");
                    expect(_.has(matrix, "freqMatrix")).toBeTruthy("Expecting 'freqMatrix' property in conceptMatrix");
                    expect(_.has(matrix, "concepts")).toBeTruthy("Expecting 'concepts' property in conceptMatrix");
                    expect(_.size(_.get(matrix, "concepts"))).toEqual(20, "Expected 20 concepts");
                    _.each(_.get(matrix, "concepts"), function (concept) {
                        expect(concept).toBeValidConcept();
                    });
                    done();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should aggregate of sources of resulting articles", function (done) { return __awaiter(_this, void 0, void 0, function () {
        var requestArticlesSourceAggr, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    requestArticlesSourceAggr = new index_1.RequestArticlesSourceAggr({ returnInfo: utils.returnInfo });
                    query.setRequestedResult(requestArticlesSourceAggr);
                    return [4 /*yield*/, er.execQuery(query)];
                case 1:
                    response = _a.sent();
                    expect(_.has(response, "sourceAggr")).toBeTruthy("Expected to get 'sourceAggr'");
                    _.each(_.get(response, "sourceAggr.results"), function (sourceInfo) {
                        expect(_.get(sourceInfo, "source")).toBeValidSource();
                        expect(_.has(sourceInfo, "counts")).toBeTruthy("Source info should contain counts object");
                        expect(_.has(sourceInfo, "counts.frequency")).toBeTruthy("Counts should contain a frequency");
                        expect(_.has(sourceInfo, "counts.ratio")).toBeTruthy("Counts should contain a ratio");
                    });
                    done();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should test query articles iterator (1)", function (done) { return __awaiter(_this, void 0, void 0, function () {
        var _this = this;
        var keywords, conceptUri, q, articlesSize;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    keywords = "trump";
                    return [4 /*yield*/, er.getConceptUri("Obama")];
                case 1:
                    conceptUri = _a.sent();
                    q = new index_1.QueryArticlesIter(er, { keywords: keywords, conceptUri: conceptUri });
                    articlesSize = 0;
                    q.execQuery(function (items) {
                        articlesSize += _.size(items);
                    }, function () { return __awaiter(_this, void 0, void 0, function () {
                        var q2, response;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    q2 = new index_1.QueryArticles({ keywords: keywords, conceptUri: conceptUri });
                                    return [4 /*yield*/, er.execQuery(q2)];
                                case 1:
                                    response = _a.sent();
                                    expect(_.get(response, "articles.totalResults")).toEqual(articlesSize);
                                    done();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
            }
        });
    }); });
    it("should test query articles iterator (2)", function (done) { return __awaiter(_this, void 0, void 0, function () {
        var keywords, conceptUri, sourceUri, q;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    keywords = "trump";
                    return [4 /*yield*/, er.getConceptUri("Obama")];
                case 1:
                    conceptUri = _a.sent();
                    return [4 /*yield*/, er.getNewsSourceUri("bbc")];
                case 2:
                    sourceUri = _a.sent();
                    q = new index_1.QueryArticlesIter(er, { keywords: keywords, conceptUri: conceptUri, sourceUri: sourceUri, returnInfo: utils.returnInfo, maxItems: 50, articleBatchSize: 10 });
                    q.execQuery(function (items, error) {
                        _.each(items, function (item) {
                            expect(item).toContainConcept(conceptUri);
                            expect(item).toContainSource(sourceUri);
                            expect(item).toContainBodyText("trump");
                        });
                    }, function () {
                        done();
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it("should test query articles iterator (3)", function (done) { return __awaiter(_this, void 0, void 0, function () {
        var keywords, conceptUri, sourceUri, categoryUri, q;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    keywords = "trump";
                    return [4 /*yield*/, er.getConceptUri("Obama")];
                case 1:
                    conceptUri = _a.sent();
                    return [4 /*yield*/, er.getNewsSourceUri("bbc")];
                case 2:
                    sourceUri = _a.sent();
                    return [4 /*yield*/, er.getCategoryUri("business")];
                case 3:
                    categoryUri = _a.sent();
                    q = new index_1.QueryArticlesIter(er, { conceptUri: conceptUri, sourceUri: sourceUri, categoryUri: categoryUri, returnInfo: utils.returnInfo, maxItems: 50, articleBatchSize: 10 });
                    q.execQuery(function (items, error) {
                        _.each(items, function (item) {
                            expect(item).toContainConcept(conceptUri);
                            expect(item).toContainSource(sourceUri);
                            expect(item).toContainCategory(categoryUri);
                        });
                    }, function () {
                        done();
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it("should test query articles iterator (4)", function (done) { return __awaiter(_this, void 0, void 0, function () {
        var conceptUri, ignoreConceptUri, _a, ignoreKeywords, ignoreSourceUri, _b, ignoreCategoryUri, _c, q;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, er.getConceptUri("Obama")];
                case 1:
                    conceptUri = _d.sent();
                    return [4 /*yield*/, er.getConceptUri("politics")];
                case 2:
                    _a = [_d.sent()];
                    return [4 /*yield*/, er.getConceptUri("china")];
                case 3:
                    _a = _a.concat([_d.sent()]);
                    return [4 /*yield*/, er.getConceptUri("united states")];
                case 4:
                    ignoreConceptUri = _a.concat([_d.sent()]);
                    ignoreKeywords = ["trump", "politics", "michelle"];
                    return [4 /*yield*/, er.getNewsSourceUri("daily caller")];
                case 5:
                    _b = [_d.sent()];
                    return [4 /*yield*/, er.getNewsSourceUri("aawsat")];
                case 6:
                    _b = _b.concat([_d.sent()]);
                    return [4 /*yield*/, er.getNewsSourceUri("svodka")];
                case 7:
                    ignoreSourceUri = _b.concat([_d.sent()]);
                    return [4 /*yield*/, er.getCategoryUri("business")];
                case 8:
                    _c = [_d.sent()];
                    return [4 /*yield*/, er.getCategoryUri("politics")];
                case 9:
                    ignoreCategoryUri = _c.concat([_d.sent()]);
                    q = new index_1.QueryArticlesIter(er, { conceptUri: conceptUri, ignoreConceptUri: ignoreConceptUri, ignoreKeywords: ignoreKeywords, ignoreSourceUri: ignoreSourceUri, ignoreCategoryUri: ignoreCategoryUri, returnInfo: utils.returnInfo, maxItems: 50, articleBatchSize: 10 });
                    q.execQuery(function (items, error) {
                        _.each(items, function (item) {
                            // TODO: Obama is not present in the result concepts
                            // expect(item).toContainConcept(conceptUri);
                            _.each(ignoreConceptUri, function (uri) {
                                expect(item).not.toContainConcept(uri);
                            });
                            _.each(ignoreKeywords, function (text) {
                                expect(item).not.toContainBodyText(text);
                            });
                            _.each(ignoreSourceUri, function (uri) {
                                expect(item).not.toContainSource(uri);
                            });
                            _.each(ignoreCategoryUri, function (uri) {
                                expect(item).not.toContainCategory(uri);
                            });
                        });
                    }, function () {
                        done();
                    });
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=queryArticles.spec.js.map