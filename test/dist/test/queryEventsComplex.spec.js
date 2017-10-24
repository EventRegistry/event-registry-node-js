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
describe("Query Events Complex", function () {
    var er = utils_1.Utils.initAPI();
    var utils = new utils_1.Utils();
    var conceptUris;
    var sourceUris;
    var categoryUri;
    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = {};
                    return [4 /*yield*/, er.getConceptUri("obama")];
                case 1:
                    _a.obama = _c.sent();
                    return [4 /*yield*/, er.getConceptUri("trump")];
                case 2:
                    conceptUris = (_a.trump = _c.sent(),
                        _a);
                    _b = {};
                    return [4 /*yield*/, er.getNewsSourceUri("bbc")];
                case 3:
                    _b.bbc = _c.sent();
                    return [4 /*yield*/, er.getNewsSourceUri("associated press")];
                case 4:
                    sourceUris = (_b.ap = _c.sent(),
                        _b);
                    return [4 /*yield*/, er.getCategoryUri("business")];
                case 5:
                    categoryUri = _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should compare same results (1)", function () { return __awaiter(_this, void 0, void 0, function () {
        var cq1, cq2, q, listRes1, listRes2, listRes3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cq1 = new index_1.ComplexEventQuery(new index_1.BaseQuery({
                        conceptUri: index_1.QueryItems.AND(_.values(conceptUris)),
                        exclude: new index_1.BaseQuery({ lang: index_1.QueryItems.OR(["eng", "deu"]) }),
                    }));
                    cq2 = new index_1.ComplexEventQuery(index_1.CombinedQuery.AND([
                        new index_1.BaseQuery({ conceptUri: conceptUris.obama }),
                        new index_1.BaseQuery({ conceptUri: conceptUris.trump }),
                    ], new index_1.BaseQuery({ lang: index_1.QueryItems.OR(["eng", "deu"]) })));
                    q = new index_1.QueryEvents({ conceptUri: index_1.QueryItems.AND(_.values(conceptUris)), ignoreLang: ["eng", "deu"] });
                    return [4 /*yield*/, utils.getEventsQueryUriListForComplexQuery(er, new index_1.QueryEvents(), cq1)];
                case 1:
                    listRes1 = _a.sent();
                    return [4 /*yield*/, utils.getEventsQueryUriListForComplexQuery(er, new index_1.QueryEvents(), cq2)];
                case 2:
                    listRes2 = _a.sent();
                    return [4 /*yield*/, utils.getQueryUriListForQueryEvents(er, q)];
                case 3:
                    listRes3 = _a.sent();
                    expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes2, "totalResults"));
                    expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes3, "totalResults"));
                    return [2 /*return*/];
            }
        });
    }); });
    it("should compare same results (2)", function () { return __awaiter(_this, void 0, void 0, function () {
        var cq1, cq2, q, listRes1, listRes2, listRes3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cq1 = new index_1.ComplexEventQuery(new index_1.BaseQuery({
                        sourceUri: index_1.QueryItems.OR(_.values(sourceUris)),
                        exclude: new index_1.BaseQuery({ conceptUri: index_1.QueryItems.OR([conceptUris.obama]) }),
                    }));
                    cq2 = new index_1.ComplexEventQuery(index_1.CombinedQuery.OR([
                        new index_1.BaseQuery({ sourceUri: sourceUris.bbc }),
                        new index_1.BaseQuery({ sourceUri: sourceUris.ap }),
                    ], new index_1.BaseQuery({ conceptUri: index_1.QueryItems.OR([conceptUris.obama]) })));
                    q = new index_1.QueryEvents({ sourceUri: _.values(sourceUris), ignoreConceptUri: conceptUris.obama });
                    return [4 /*yield*/, utils.getEventsQueryUriListForComplexQuery(er, new index_1.QueryEvents(), cq1)];
                case 1:
                    listRes1 = _a.sent();
                    return [4 /*yield*/, utils.getEventsQueryUriListForComplexQuery(er, new index_1.QueryEvents(), cq2)];
                case 2:
                    listRes2 = _a.sent();
                    return [4 /*yield*/, utils.getQueryUriListForQueryEvents(er, q)];
                case 3:
                    listRes3 = _a.sent();
                    expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes2, "totalResults"));
                    expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes3, "totalResults"));
                    return [2 /*return*/];
            }
        });
    }); });
    it("should compare same results (3)", function () { return __awaiter(_this, void 0, void 0, function () {
        var cq1, cq2, q, listRes1, listRes2, listRes3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cq1 = new index_1.ComplexEventQuery(new index_1.BaseQuery({
                        dateStart: "2017-02-05",
                        dateEnd: "2017-02-06",
                        exclude: new index_1.BaseQuery({ categoryUri: categoryUri }),
                    }));
                    cq2 = new index_1.ComplexEventQuery(index_1.CombinedQuery.AND([
                        new index_1.BaseQuery({ dateStart: "2017-02-05" }),
                        new index_1.BaseQuery({ dateEnd: "2017-02-06" }),
                    ], new index_1.BaseQuery({ categoryUri: categoryUri })));
                    q = new index_1.QueryEvents({ dateStart: "2017-02-05", dateEnd: "2017-02-06", ignoreCategoryUri: categoryUri });
                    return [4 /*yield*/, utils.getEventsQueryUriListForComplexQuery(er, new index_1.QueryEvents(), cq1)];
                case 1:
                    listRes1 = _a.sent();
                    return [4 /*yield*/, utils.getEventsQueryUriListForComplexQuery(er, new index_1.QueryEvents(), cq2)];
                case 2:
                    listRes2 = _a.sent();
                    return [4 /*yield*/, utils.getQueryUriListForQueryEvents(er, q)];
                case 3:
                    listRes3 = _a.sent();
                    expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes2, "totalResults"));
                    expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes3, "totalResults"));
                    return [2 /*return*/];
            }
        });
    }); });
    it("should compare same results (4)", function () { return __awaiter(_this, void 0, void 0, function () {
        var cq1, q, listRes1, listRes2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cq1 = index_1.QueryEvents.initWithComplexQuery(new index_1.QueryEvents(), "\n            {\n                \"$query\": {\n                    \"dateStart\": \"2017-02-05\", \"dateEnd\": \"2017-02-06\",\n                    \"$not\": {\n                        \"categoryUri\": \"" + categoryUri + "\"\n                    }\n                }\n            }\n        ");
                    q = new index_1.QueryEvents({ dateStart: "2017-02-05", dateEnd: "2017-02-06", ignoreCategoryUri: categoryUri });
                    return [4 /*yield*/, utils.getQueryUriListForQueryEvents(er, cq1)];
                case 1:
                    listRes1 = _a.sent();
                    return [4 /*yield*/, utils.getQueryUriListForQueryEvents(er, q)];
                case 2:
                    listRes2 = _a.sent();
                    expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes2, "totalResults"));
                    return [2 /*return*/];
            }
        });
    }); });
    it("should compare same results (5)", function () { return __awaiter(_this, void 0, void 0, function () {
        var politicsUri, cq1, cq2, listRes1, listRes2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, er.getCategoryUri("politics")];
                case 1:
                    politicsUri = _a.sent();
                    cq1 = index_1.QueryEvents.initWithComplexQuery(new index_1.QueryEvents(), "\n        {\n            \"$query\": {\n                \"$or\": [\n                    { \"dateStart\": \"2017-02-05\", \"dateEnd\": \"2017-02-05\" },\n                    { \"conceptUri\": \"" + conceptUris.trump + "\" },\n                    { \"categoryUri\": \"" + politicsUri + "\" }\n                ],\n                \"$not\": {\n                    \"$or\": [\n                        { \"dateStart\": \"2017-02-04\", \"dateEnd\": \"2017-02-04\" },\n                        { \"conceptUri\": \"" + conceptUris.obama + "\" }\n                    ]\n                }\n            }\n        }\n        ");
                    cq2 = new index_1.ComplexEventQuery(index_1.CombinedQuery.OR([
                        new index_1.BaseQuery({ dateStart: "2017-02-04", dateEnd: "2017-02-05" }),
                        new index_1.BaseQuery({ conceptUri: conceptUris.trump }),
                        new index_1.BaseQuery({ categoryUri: politicsUri }),
                    ], index_1.CombinedQuery.OR([
                        new index_1.BaseQuery({ dateStart: "2017-02-04", dateEnd: "2017-02-04" }),
                        new index_1.BaseQuery({ conceptUri: conceptUris.obama }),
                    ])));
                    return [4 /*yield*/, utils.getQueryUriListForQueryEvents(er, cq1)];
                case 2:
                    listRes1 = _a.sent();
                    return [4 /*yield*/, utils.getEventsQueryUriListForComplexQuery(er, new index_1.QueryEvents(), cq2)];
                case 3:
                    listRes2 = _a.sent();
                    expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes2, "totalResults"));
                    return [2 /*return*/];
            }
        });
    }); });
    it("should get valid content", function (done) { return __awaiter(_this, void 0, void 0, function () {
        var politicsUri, cq, returnInfo, iter;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, er.getCategoryUri("politics")];
                case 1:
                    politicsUri = _a.sent();
                    cq = new index_1.ComplexEventQuery(index_1.CombinedQuery.OR([
                        new index_1.BaseQuery({ dateStart: "2017-02-04", dateEnd: "2017-02-05" }),
                        new index_1.BaseQuery({ conceptUri: conceptUris.trump }),
                        new index_1.BaseQuery({ categoryUri: politicsUri }),
                    ], index_1.CombinedQuery.OR([
                        new index_1.BaseQuery({ dateStart: "2017-02-04", dateEnd: "2017-02-04" }),
                        new index_1.BaseQuery({ conceptUri: conceptUris.obama }),
                    ])));
                    returnInfo = new index_1.ReturnInfo({ eventInfo: new index_1.EventInfoFlags({ concepts: true, categories: true, stories: true }) });
                    iter = index_1.QueryEventsIter.initWithComplexQuery(new index_1.QueryEventsIter(er, { returnInfo: returnInfo }), cq);
                    iter.execQuery(function (items) {
                        _.each(items, function (item) {
                            var hasConcept = _.find(_.get(item, "concepts", []), function (_a) {
                                var uri = _a.uri;
                                return uri === conceptUris.trump;
                            });
                            var hasCategory = _.find(_.get(item, "categories", []), function (_a) {
                                var uri = _a.uri;
                                return _.includes(uri, politicsUri);
                            });
                            var hasDate = _.get(item, "eventDate") === "2017-02-05";
                            expect(hasConcept || hasCategory || hasDate).toBeTruthy("Invalid article " + item.uri + " that should not be in the results.");
                            _.each(_.get(item, "concepts", []), function (_a) {
                                var uri = _a.uri;
                                expect(uri).not.toEqual(conceptUris.obama);
                            });
                            expect(_.get(item, "eventDate")).not.toEqual("2017-02-04");
                        });
                    }, function () {
                        done();
                    });
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=queryEventsComplex.spec.js.map