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
describe("Query Events", function () {
    var er = utils_1.Utils.initAPI();
    var utils = new utils_1.Utils();
    var query;
    var requestEventsInfo;
    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    requestEventsInfo = new index_1.RequestEventsInfo({ count: 10, returnInfo: utils.returnInfo });
                    _a = index_1.QueryEvents.bind;
                    _b = {};
                    return [4 /*yield*/, er.getConceptUri("Obama")];
                case 1:
                    query = new (_a.apply(index_1.QueryEvents, [void 0, (_b.conceptUri = _c.sent(), _b)]))();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should test event list", function () { return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query.setRequestedResult(requestEventsInfo);
                    return [4 /*yield*/, er.execQuery(query)];
                case 1:
                    response = _a.sent();
                    expect(response).toBeValidGeneralEventList();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should test event list with source search", function () { return __awaiter(_this, void 0, void 0, function () {
        var q1, response1, q2, response2, results1, results2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    q1 = new index_1.QueryEvents({ keywords: "germany" });
                    q1.setRequestedResult(requestEventsInfo);
                    return [4 /*yield*/, er.execQuery(q1)];
                case 1:
                    response1 = _a.sent();
                    expect(response1).toBeValidGeneralEventList();
                    q2 = new index_1.QueryEvents({ keywords: "germany" });
                    q2.setRequestedResult(requestEventsInfo);
                    return [4 /*yield*/, er.execQuery(q2)];
                case 2:
                    response2 = _a.sent();
                    expect(response2).toBeValidGeneralEventList();
                    results1 = _.sortBy(response1["events"]["results"], "id");
                    results2 = _.sortBy(response2["events"]["results"], "id");
                    expect(_.size(results1)).toEqual(_.size(results2), "Keyword search should return responses of the same size");
                    return [2 /*return*/];
            }
        });
    }); });
    it("should test event list with source search", function () { return __awaiter(_this, void 0, void 0, function () {
        var q1, _a, _b, response1, q2, _c, _d, response2, results1, results2;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _a = index_1.QueryEvents.bind;
                    _b = {};
                    return [4 /*yield*/, er.getNewsSourceUri("bbc")];
                case 1:
                    q1 = new (_a.apply(index_1.QueryEvents, [void 0, (_b.sourceUri = _e.sent(), _b)]))();
                    q1.setRequestedResult(requestEventsInfo);
                    return [4 /*yield*/, er.execQuery(q1)];
                case 2:
                    response1 = _e.sent();
                    expect(response1).toBeValidGeneralEventList();
                    _c = index_1.QueryEvents.bind;
                    _d = {};
                    return [4 /*yield*/, er.getNewsSourceUri("bbc")];
                case 3:
                    q2 = new (_c.apply(index_1.QueryEvents, [void 0, (_d.sourceUri = _e.sent(), _d)]))();
                    q2.setRequestedResult(requestEventsInfo);
                    return [4 /*yield*/, er.execQuery(q2)];
                case 4:
                    response2 = _e.sent();
                    expect(response2).toBeValidGeneralEventList();
                    results1 = _.sortBy(response1["events"]["results"], "id");
                    results2 = _.sortBy(response2["events"]["results"], "id");
                    expect(_.size(results1)).toEqual(_.size(results2), "Source search should return responses of the same size");
                    return [2 /*return*/];
            }
        });
    }); });
    it("should test event list with source search", function () { return __awaiter(_this, void 0, void 0, function () {
        var q1, _a, _b, response1, q2, _c, _d, response2, results1, results2;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _a = index_1.QueryEvents.bind;
                    _b = {};
                    return [4 /*yield*/, er.getCategoryUri("disa")];
                case 1:
                    q1 = new (_a.apply(index_1.QueryEvents, [void 0, (_b.categoryUri = _e.sent(), _b)]))();
                    q1.setRequestedResult(requestEventsInfo);
                    return [4 /*yield*/, er.execQuery(q1)];
                case 2:
                    response1 = _e.sent();
                    expect(response1).toBeValidGeneralEventList();
                    _c = index_1.QueryEvents.bind;
                    _d = {};
                    return [4 /*yield*/, er.getCategoryUri("disa")];
                case 3:
                    q2 = new (_c.apply(index_1.QueryEvents, [void 0, (_d.categoryUri = _e.sent(), _d)]))();
                    q2.setRequestedResult(requestEventsInfo);
                    return [4 /*yield*/, er.execQuery(q2)];
                case 4:
                    response2 = _e.sent();
                    expect(response2).toBeValidGeneralEventList();
                    results1 = _.sortBy(response1["events"]["results"], "id");
                    results2 = _.sortBy(response2["events"]["results"], "id");
                    expect(_.size(results1)).toEqual(_.size(results2), "Source search should return responses of the same size");
                    return [2 /*return*/];
            }
        });
    }); });
    it("should test event list with language search", function () { return __awaiter(_this, void 0, void 0, function () {
        var q1, response1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    q1 = new index_1.QueryEvents({ lang: "spa" });
                    q1.setRequestedResult(requestEventsInfo);
                    return [4 /*yield*/, er.execQuery(q1)];
                case 1:
                    response1 = _a.sent();
                    expect(response1).toBeValidGeneralEventList();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should test event list with minimal articles search", function () { return __awaiter(_this, void 0, void 0, function () {
        var q1, response1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    q1 = new index_1.QueryEvents({ minArticlesInEvent: 100 });
                    q1.setRequestedResult(requestEventsInfo);
                    return [4 /*yield*/, er.execQuery(q1)];
                case 1:
                    response1 = _a.sent();
                    expect(response1).toBeValidGeneralEventList();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should test search by keyword", function () { return __awaiter(_this, void 0, void 0, function () {
        var q1, evInfo, retInfo1, reqEvInfo, retInfo2, reqEvConceptsTrends, response, events, lastEventDate;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    q1 = new index_1.QueryEvents({ keywords: "car" });
                    evInfo = new index_1.EventInfoFlags({ concepts: false,
                        articleCounts: false,
                        title: false,
                        summary: false,
                        categories: false,
                        location: false,
                        stories: false,
                        imageCount: 0,
                    });
                    retInfo1 = new index_1.ReturnInfo({ conceptInfo: new index_1.ConceptInfoFlags({ type: "org" }), eventInfo: evInfo });
                    reqEvInfo = new index_1.RequestEventsInfo({ page: 1,
                        count: 10,
                        sortBy: "date",
                        sortByAsc: false,
                        returnInfo: retInfo1,
                    });
                    q1.addRequestedResult(reqEvInfo);
                    retInfo2 = new index_1.ReturnInfo({ conceptInfo: new index_1.ConceptInfoFlags({ type: ["org", "loc"], lang: "spa" }) });
                    reqEvConceptsTrends = new index_1.RequestEventsConceptTrends({ returnInfo: retInfo2 });
                    q1.addRequestedResult(reqEvConceptsTrends);
                    return [4 /*yield*/, er.execQuery(q1)];
                case 1:
                    response = _a.sent();
                    expect(_.has(response, "events")).toBeTruthy("Results should contain events");
                    expect(_.has(response, "conceptTrends")).toBeTruthy("Results should contain conceptAggr");
                    _.each(_.get(response, "conceptTrends.conceptInfo", []), function (concept) {
                        expect(concept.type === "loc" || concept.type === "org").toBeTruthy("Got concept of invalid type");
                        expect(_.has(concept, "label.spa")).toBeTruthy("Concept did not contain label in expected language");
                    });
                    events = _.get(response, "events.results", []);
                    lastEventDate = _.isEmpty(events) ? "" : _.get(_.first(events), "eventDate");
                    _.each(events, function (event) {
                        expect(event.eventDate <= lastEventDate).toBeTruthy("Events are not sorted by date");
                        lastEventDate = event.eventDate;
                        expect(_.has(event, "articleCounts")).toBeFalsy("Event should not contain articleCounts");
                        expect(_.has(event, "categories")).toBeFalsy("Event should not contain categories");
                        expect(_.has(event, "concepts")).toBeFalsy("Event should not contain concepts");
                        expect(_.has(event, "location")).toBeFalsy("Event should not contain location");
                        expect(_.has(event, "stories")).toBeFalsy("Event should not contain stories");
                        expect(_.has(event, "images")).toBeFalsy("Event should not contain images");
                        expect(_.has(event, "title")).toBeFalsy("Event should not contain title");
                        expect(_.has(event, "summary")).toBeFalsy("Event should not contain summary");
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it("should test event list with combined search", function () { return __awaiter(_this, void 0, void 0, function () {
        var conceptUri, categoryUri, q1, response1, q2, response2, results1, results2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, er.getConceptUri("Merkel")];
                case 1:
                    conceptUri = _a.sent();
                    return [4 /*yield*/, er.getCategoryUri("Business")];
                case 2:
                    categoryUri = _a.sent();
                    q1 = new index_1.QueryEvents({ keywords: "germany", lang: ["eng", "deu"], conceptUri: [conceptUri], categoryUri: [categoryUri] });
                    q1.setRequestedResult(new index_1.RequestEventsInfo({ count: 10, returnInfo: utils.returnInfo }));
                    return [4 /*yield*/, er.execQuery(q1)];
                case 3:
                    response1 = _a.sent();
                    expect(response1).toBeValidGeneralEventList();
                    q2 = new index_1.QueryEvents({ keywords: "germany", lang: ["eng", "deu"], conceptUri: conceptUri, categoryUri: categoryUri });
                    q2.setRequestedResult(new index_1.RequestEventsInfo({ count: 10, returnInfo: utils.returnInfo }));
                    return [4 /*yield*/, er.execQuery(q2)];
                case 4:
                    response2 = _a.sent();
                    expect(response2).toBeValidGeneralEventList();
                    results1 = _.sortBy(response1["events"]["results"], "id");
                    results2 = _.sortBy(response2["events"]["results"], "id");
                    expect(_.size(results1)).toEqual(_.size(results2), "Source search should return responses of the same size");
                    return [2 /*return*/];
            }
        });
    }); });
    it("should test concept trends", function () { return __awaiter(_this, void 0, void 0, function () {
        var requestEventsConceptTrends, response, trends;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    requestEventsConceptTrends = new index_1.RequestEventsConceptTrends({ conceptCount: 5, returnInfo: utils.returnInfo });
                    query.setRequestedResult(requestEventsConceptTrends);
                    return [4 /*yield*/, er.execQuery(query)];
                case 1:
                    response = _a.sent();
                    expect(_.has(response, "conceptTrends")).toBeTruthy("Expected to get 'conceptTrends'");
                    expect(_.has(response, "conceptTrends.trends")).toBeTruthy("Expected to get 'trends' property in conceptTrends");
                    expect(_.has(response, "conceptTrends.conceptInfo")).toBeTruthy("Expected to get 'conceptInfo' property in conceptTrends");
                    expect(_.size(_.get(response, "conceptTrends.conceptInfo", []))).toEqual(5, "Expected to get 5 concepts in concept trends");
                    trends = _.get(response, "conceptTrends.trends");
                    expect(_.isEmpty(trends)).toBeFalsy("Expected to get trends for some days");
                    _.each(trends, function (trend) {
                        expect(_.has(trend, "date")).toBeTruthy("A trend should have a date");
                        expect(_.has(trend, "conceptFreq")).toBeTruthy("A trend should have a conceptFreq");
                        expect(_.has(trend, "totArts")).toBeTruthy("A trend should have a totArts property");
                        expect(_.size(_.get(trend, "conceptFreq", []))).toBeLessThanOrEqual(5, "Concept frequencies should contain 5 elements - one for each concept");
                    });
                    _.each(_.get(response, "conceptTrends.conceptInfo", []), function (concept) {
                        expect(concept).toBeValidConcept();
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it("should test concept aggregates", function () { return __awaiter(_this, void 0, void 0, function () {
        var requestEventsConceptAggr, response, concepts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    requestEventsConceptAggr = new index_1.RequestEventsConceptAggr({ conceptCount: 50, returnInfo: utils.returnInfo });
                    query.setRequestedResult(requestEventsConceptAggr);
                    return [4 /*yield*/, er.execQuery(query)];
                case 1:
                    response = _a.sent();
                    expect(_.has(response, "conceptAggr")).toBeTruthy("Expected to get 'conceptAggr'");
                    concepts = _.get(response, "conceptAggr.results", []);
                    // TODO: If the ConceptCount is included then we return 150 aggregates
                    // expect(_.size(concepts)).toEqual(50, "Expected a different number of concept in conceptAggr");
                    _.each(concepts, function (concept) {
                        expect(concept).toBeValidConcept();
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it("should test keyword aggregates", function () { return __awaiter(_this, void 0, void 0, function () {
        var requestEventsKeywordAggr, response, keywords;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    requestEventsKeywordAggr = new index_1.RequestEventsKeywordAggr();
                    query.setRequestedResult(requestEventsKeywordAggr);
                    return [4 /*yield*/, er.execQuery(query)];
                case 1:
                    response = _a.sent();
                    expect(_.has(response, "keywordAggr")).toBeTruthy("Expected to get 'keywordAggr'");
                    keywords = _.get(response, "keywordAggr.results", []);
                    expect(_.size(keywords)).toBeGreaterThan(0, "Expected to get some keywords");
                    _.each(keywords, function (kw) {
                        expect(_.has(kw, "keyword")).toBeTruthy("Expected a keyword property");
                        expect(_.has(kw, "weight")).toBeTruthy("Expected a weight property");
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it("should test category aggregates", function () { return __awaiter(_this, void 0, void 0, function () {
        var requestEventsCategoryAggr, response, categories;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    requestEventsCategoryAggr = new index_1.RequestEventsCategoryAggr(utils.returnInfo);
                    query.setRequestedResult(requestEventsCategoryAggr);
                    return [4 /*yield*/, er.execQuery(query)];
                case 1:
                    response = _a.sent();
                    expect(_.has(response, "categoryAggr")).toBeTruthy("Expected to get 'categoryAggr'");
                    categories = _.get(response, "categoryAggr.results", []);
                    expect(_.size(categories)).toBeGreaterThan(0, "Expected to get some categories");
                    _.each(categories, function (category) {
                        expect(category).toBeValidCategory();
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it("should test concept matrix", function () { return __awaiter(_this, void 0, void 0, function () {
        var requestEventsConceptMatrix, response, matrix;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    requestEventsConceptMatrix = new index_1.RequestEventsConceptMatrix({ conceptCount: 20, returnInfo: utils.returnInfo });
                    query.setRequestedResult(requestEventsConceptMatrix);
                    return [4 /*yield*/, er.execQuery(query)];
                case 1:
                    response = _a.sent();
                    expect(_.has(response, "conceptMatrix")).toBeTruthy("Expected to get 'conceptMatrix'");
                    matrix = _.get(response, "conceptMatrix");
                    expect(_.has(matrix, "sampleSize")).toBeTruthy("Expecting 'sampleSize' property in conceptMatrix");
                    expect(_.has(matrix, "freqMatrix")).toBeTruthy("Expecting 'freqMatrix' property in conceptMatrix");
                    expect(_.has(matrix, "concepts")).toBeTruthy("Expecting 'concepts' property in conceptMatrix");
                    expect(_.size(_.get(matrix, "concepts", []))).toEqual(20, "Expected 20 concepts");
                    _.each(_.get(matrix, "concepts", []), function (concept) {
                        expect(concept).toBeValidConcept();
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it("should test source aggregates", function () { return __awaiter(_this, void 0, void 0, function () {
        var requestEventsSourceAggr, response, sources;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    requestEventsSourceAggr = new index_1.RequestEventsSourceAggr({ sourceCount: 15, returnInfo: utils.returnInfo });
                    query.setRequestedResult(requestEventsSourceAggr);
                    return [4 /*yield*/, er.execQuery(query)];
                case 1:
                    response = _a.sent();
                    expect(_.has(response, "sourceAggr")).toBeTruthy("Expected to get 'sourceAggr'");
                    sources = _.get(response, "sourceAggr.results", []);
                    expect(_.size(sources)).toEqual(15, "Expected 15 sources");
                    _.each(sources, function (sourceInfo) {
                        expect(_.get(sourceInfo, "source")).toBeValidSource();
                        expect(_.has(sourceInfo, "counts")).toBeTruthy("Source info should contain counts object");
                        expect(_.has(sourceInfo, "counts.frequency")).toBeTruthy("Counts should contain a frequency");
                        expect(_.has(sourceInfo, "counts.ratio")).toBeTruthy("Counts should contain ratio");
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it("should test search by source", function () { return __awaiter(_this, void 0, void 0, function () {
        var q, _a, _b, eventInfo, returnInfo1, response, concepts, events, lastArtCount;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = index_1.QueryEvents.bind;
                    _b = {};
                    return [4 /*yield*/, er.getNewsSourceUri("bbc")];
                case 1:
                    q = new (_a.apply(index_1.QueryEvents, [void 0, (_b.sourceUri = _c.sent(), _b)]))();
                    q.addRequestedResult(new index_1.RequestEventsUriList());
                    eventInfo = new index_1.EventInfoFlags({ concepts: true, articleCounts: true, title: true, summary: true, categories: true, location: true, stories: true, imageCount: 1 });
                    returnInfo1 = new index_1.ReturnInfo({ conceptInfo: new index_1.ConceptInfoFlags({ lang: "deu", type: "wiki" }), eventInfo: eventInfo });
                    q.addRequestedResult(new index_1.RequestEventsInfo({ page: 1, count: 100, sortBy: "size", sortByAsc: true, returnInfo: returnInfo1 }));
                    q.addRequestedResult(new index_1.RequestEventsConceptAggr({ conceptCount: 5, returnInfo: new index_1.ReturnInfo({ conceptInfo: new index_1.ConceptInfoFlags({ type: ["org", "loc"] }) }) }));
                    return [4 /*yield*/, er.execQuery(q)];
                case 2:
                    response = _c.sent();
                    expect(_.has(response, "conceptAggr")).toBeTruthy("Results should contain conceptAggr");
                    expect(_.has(response, "events")).toBeTruthy("Results should contain events");
                    expect(_.has(response, "uriList")).toBeTruthy("Results should contain uriList");
                    concepts = _.get(response, "conceptAggr.results", []);
                    expect(_.size(concepts)).toBeLessThanOrEqual(10, "Received a list of concepts that is too long");
                    _.each(concepts, function (concept) {
                        expect(concept.type === "loc" || concept.type === "org").toBeTruthy("Got concept of invalid type");
                    });
                    events = _.get(response, "events.results", []);
                    expect(_.size(events)).toBeLessThanOrEqual(100, "Returned list of events was too long");
                    lastArtCount = 0;
                    _.each(events, function (event) {
                        expect(_.has(event, "articleCounts")).toBeTruthy("Event should contain articleCounts");
                        expect(_.has(event, "categories")).toBeTruthy("Event should contain categories");
                        expect(_.has(event, "concepts")).toBeTruthy("Event should contain concepts");
                        expect(_.has(event, "stories")).toBeTruthy("Event should contain stories");
                        expect(_.has(event, "title")).toBeTruthy("Event should contain title");
                        expect(_.has(event, "summary")).toBeTruthy("Event should contain summary");
                        expect(_.has(event, "images")).toBeTruthy("Event should contain images");
                        expect(_.has(event, "location")).toBeTruthy("Event should contain location");
                        lastArtCount = event.totalArticleCount;
                        _.each(_.get(event, "concepts", []), function (concept) {
                            expect(_.has(concept, "label.deu")).toBeTruthy("Concept should contain label in german language");
                            expect(concept.type === "wiki").toBeTruthy("Got concept of invalid type");
                        });
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it("should query events iterator (1)", function (done) { return __awaiter(_this, void 0, void 0, function () {
        var _this = this;
        var conceptUri, q, eventsSize;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, er.getConceptUri("Obama")];
                case 1:
                    conceptUri = _a.sent();
                    q = new index_1.QueryEventsIter(er, { keywords: "germany", conceptUri: conceptUri });
                    eventsSize = 0;
                    q.execQuery(function (items) {
                        eventsSize += _.size(items);
                    }, function () { return __awaiter(_this, void 0, void 0, function () {
                        var q2, response;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    q2 = new index_1.QueryEvents({ keywords: "germany", conceptUri: conceptUri });
                                    return [4 /*yield*/, er.execQuery(q2)];
                                case 1:
                                    response = _a.sent();
                                    expect(_.get(response, "events.totalResults")).toEqual(eventsSize);
                                    done();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
            }
        });
    }); });
    it("should query events iterator (2)", function (done) { return __awaiter(_this, void 0, void 0, function () {
        var conceptUri, q;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, er.getConceptUri("Obama")];
                case 1:
                    conceptUri = _a.sent();
                    q = new index_1.QueryEventsIter(er, { lang: index_1.allLangs, keywords: "germany", conceptUri: conceptUri, returnInfo: utils.returnInfo, maxItems: 10 });
                    q.execQuery(function (items) {
                        _.each(items, function (item) {
                            expect(item).toContainConcept(conceptUri);
                            new index_1.QueryEventArticlesIter(er, item["uri"], { lang: index_1.allLangs, returnInfo: utils.returnInfo }).execQuery(function (articles, error) {
                                var hasKeyword = false;
                                _.each(articles, function (article) {
                                    var text = _.deburr(_.toLower(_.get(article, "body")));
                                    hasKeyword = _.includes(text, "german");
                                });
                                expect(hasKeyword).toBeTruthy("At least one of the articles was expected to contain 'germany'");
                            });
                        });
                    }, function () {
                        done();
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it("should query events iterator (3)", function (done) { return __awaiter(_this, void 0, void 0, function () {
        var sourceUri, categoryUri, q;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, er.getNewsSourceUri("los angeles")];
                case 1:
                    sourceUri = _a.sent();
                    return [4 /*yield*/, er.getCategoryUri("business")];
                case 2:
                    categoryUri = _a.sent();
                    q = new index_1.QueryEventsIter(er, { lang: index_1.allLangs, keywords: "obama trump", sourceUri: sourceUri, categoryUri: categoryUri, returnInfo: utils.returnInfo });
                    q.execQuery(function (items) {
                        _.each(items, function (item) {
                            expect(item).toContainCategory(categoryUri);
                            new index_1.QueryEventArticlesIter(er, item["uri"], { lang: index_1.allLangs, returnInfo: utils.returnInfo }).execQuery(function (articles, error) {
                                if (error) {
                                    console.info(error);
                                }
                                var hasKeyword1 = false;
                                var hasKeyword2 = false;
                                _.each(articles, function (article) {
                                    var text = _.deburr(_.toLower(_.get(article, "body")));
                                    hasKeyword1 = _.includes(text, "obama");
                                    hasKeyword2 = _.includes(text, "trump");
                                });
                                expect(hasKeyword1).toBeTruthy("At least one of the articles was expected to contain 'obama'");
                                expect(hasKeyword2).toBeTruthy("At least one of the articles was expected to contain 'trump'");
                                var hasArticleFromSource = _.every(articles, function (article) { return article["source"]["uri"] === sourceUri; });
                                expect(hasArticleFromSource).toBeTruthy();
                            });
                        });
                    }, function () {
                        done();
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it("should query events iterator (4)", function (done) { return __awaiter(_this, void 0, void 0, function () {
        var obamaUri, politicsUri, chinaUri, unitedStatesUri, srcDailyCallerUri, srcAawsatUri, srcSvodkaUri, catBusinessUri, catPoliticsUri, q;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, er.getConceptUri("Obama")];
                case 1:
                    obamaUri = _a.sent();
                    return [4 /*yield*/, er.getConceptUri("politics")];
                case 2:
                    politicsUri = _a.sent();
                    return [4 /*yield*/, er.getConceptUri("china")];
                case 3:
                    chinaUri = _a.sent();
                    return [4 /*yield*/, er.getConceptUri("united states")];
                case 4:
                    unitedStatesUri = _a.sent();
                    return [4 /*yield*/, er.getNewsSourceUri("daily caller")];
                case 5:
                    srcDailyCallerUri = _a.sent();
                    return [4 /*yield*/, er.getNewsSourceUri("aawsat")];
                case 6:
                    srcAawsatUri = _a.sent();
                    return [4 /*yield*/, er.getNewsSourceUri("svodka")];
                case 7:
                    srcSvodkaUri = _a.sent();
                    return [4 /*yield*/, er.getCategoryUri("business")];
                case 8:
                    catBusinessUri = _a.sent();
                    return [4 /*yield*/, er.getCategoryUri("politics")];
                case 9:
                    catPoliticsUri = _a.sent();
                    q = new index_1.QueryEventsIter(er, { conceptUri: obamaUri,
                        ignoreConceptUri: [politicsUri, chinaUri, unitedStatesUri],
                        ignoreKeywords: ["trump", "politics", "michelle"],
                        ignoreSourceUri: [srcDailyCallerUri, srcAawsatUri, srcSvodkaUri],
                        ignoreCategoryUri: [catBusinessUri, catPoliticsUri],
                    });
                    q.execQuery(function (items) {
                        _.each(items, function (item) {
                            expect(item).toContainConcept(obamaUri);
                            expect(item).not.toContainConcept(politicsUri);
                            expect(item).not.toContainConcept(chinaUri);
                            expect(item).not.toContainConcept(unitedStatesUri);
                            expect(item).not.toContainCategory(catBusinessUri);
                            expect(item).not.toContainCategory(catPoliticsUri);
                            new index_1.QueryEventArticlesIter(er, item["uri"], { returnInfo: utils.returnInfo }).execQuery(function (articles, error) {
                                _.each(articles, function (article) {
                                    var text = _.deburr(_.toLower(_.get(article, "body")));
                                    expect(text).not.toContain("trump");
                                    expect(text).not.toContain("politics");
                                    expect(text).not.toContain("michelle");
                                });
                                var hasArticleFromSource1 = _.every(articles, function (article) { return article["source"]["uri"] === srcDailyCallerUri; });
                                var hasArticleFromSource2 = _.every(articles, function (article) { return article["source"]["uri"] === srcAawsatUri; });
                                var hasArticleFromSource3 = _.every(articles, function (article) { return article["source"]["uri"] === srcSvodkaUri; });
                                expect(hasArticleFromSource1).toBeFalsy();
                                expect(hasArticleFromSource2).toBeFalsy();
                                expect(hasArticleFromSource3).toBeFalsy();
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
//# sourceMappingURL=queryEvents.spec.js.map