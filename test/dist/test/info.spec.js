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
describe("Info", function () {
    var er = utils_1.Utils.initAPI();
    it("should return sources by uri", function () { return __awaiter(_this, void 0, void 0, function () {
        var sources, sourceUriList, sourceInfoFlags, returnInfo, q, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, er.suggestNewsSources("a", { count: 10 })];
                case 1:
                    sources = _a.sent();
                    sourceUriList = _.map(sources, "uri");
                    sourceInfoFlags = new index_1.SourceInfoFlags({ title: true,
                        description: true,
                        location: true,
                        ranking: true,
                        articleCount: true,
                        sourceGroups: true,
                        details: true,
                    });
                    returnInfo = new index_1.ReturnInfo({ sourceInfo: sourceInfoFlags });
                    q = new index_1.GetSourceInfo({ uriOrUriList: sourceUriList, returnInfo: returnInfo });
                    return [4 /*yield*/, er.execQuery(q)];
                case 2:
                    response = _a.sent();
                    expect(_.size(response)).toBe(_.size(sourceUriList), "Expected " + _.size(sourceUriList) + " sources");
                    _.each(response, function (item) {
                        expect(_.has(item, "id")).toBeTruthy("Source id is missing");
                        expect(_.has(item, "uri")).toBeTruthy("Source uri is missing");
                        expect(_.has(item, "title")).toBeTruthy("Source title is missing");
                        expect(_.has(item, "description")).toBeTruthy("Source description is missing");
                        expect(_.has(item, "ranking")).toBeTruthy("Source ranking is missing");
                        expect(_.has(item, "articleCount")).toBeTruthy("Source articleCount is missing");
                        expect(_.has(item, "sourceGroups")).toBeTruthy("Source sourceGroups is missing");
                        expect(_.has(item, "details")).toBeTruthy("Source details is missing");
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return concepts by uri", function () { return __awaiter(_this, void 0, void 0, function () {
        var concepts, uriList, conceptInfoFlags, returnInfo, q, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, er.suggestConcepts("a", { count: 10 })];
                case 1:
                    concepts = _a.sent();
                    uriList = _.map(concepts, "uri");
                    conceptInfoFlags = new index_1.ConceptInfoFlags({ type: "wiki",
                        lang: ["deu", "slv"],
                        label: true,
                        synonyms: true,
                        image: true,
                        description: true,
                        details: true,
                        conceptClassMembership: true,
                        conceptClassMembershipFull: true,
                        trendingScore: true,
                        trendingHistory: true,
                        trendingSource: ["news", "social"],
                    });
                    returnInfo = new index_1.ReturnInfo({ conceptInfo: conceptInfoFlags });
                    q = new index_1.GetConceptInfo({ uriOrUriList: uriList, returnInfo: returnInfo });
                    return [4 /*yield*/, er.execQuery(q)];
                case 2:
                    response = _a.sent();
                    expect(_.size(response)).toBe(_.size(uriList), "Expected " + _.size(uriList) + " concepts");
                    _.each(response, function (item) {
                        expect(_.has(item, "id")).toBeTruthy("Concept id is missing");
                        expect(_.has(item, "uri")).toBeTruthy("Concept uri is missing");
                        expect(_.has(item, "type")).toBeTruthy("Concept type is missing");
                        expect(_.has(item, "label")).toBeTruthy("Concept should have a label");
                        expect(_.has(item, "label.deu")).toBeTruthy("Concept should have a label in german");
                        expect(_.has(item, "label.slv")).toBeTruthy("Concept should have a label in slovene");
                        expect(_.has(item, "description")).toBeTruthy("Concept should have a description");
                        expect(_.has(item, "image")).toBeTruthy("Concept should have an image");
                        expect(_.has(item, "synonyms")).toBeTruthy("Concept should have synonyms");
                        expect(_.has(item, "details")).toBeTruthy("Concept should have details");
                        expect(_.has(item, "conceptClassMembership")).toBeTruthy("Concept should have conceptClassMembership");
                        expect(_.has(item, "conceptClassMembershipFull")).toBeTruthy("Concept should have conceptClassMembershipFull");
                        expect(_.has(item, "trendingScore")).toBeTruthy("Concept should have trendingScore");
                        expect(_.has(item, "trendingScore.news")).toBeTruthy("Concept should have trendingScore for news");
                        expect(_.has(item, "trendingScore.social")).toBeTruthy("Concept should have trendingScore for social");
                        expect(_.has(item, "trendingHistory")).toBeTruthy("Concept should have trendingHistory");
                        expect(_.has(item, "trendingHistory.news")).toBeTruthy("Concept should have trendingHistory for news");
                        expect(_.has(item, "trendingHistory.social")).toBeTruthy("Concept should have trendingHistory for social");
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it("should return categories", function () { return __awaiter(_this, void 0, void 0, function () {
        var categories, uriList, categoryInfoFlags, returnInfo, q, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, er.suggestCategories("a", { count: 10 })];
                case 1:
                    categories = _a.sent();
                    uriList = _.map(categories, "uri");
                    categoryInfoFlags = new index_1.CategoryInfoFlags({ parentUri: true,
                        childrenUris: true,
                        trendingScore: true,
                        trendingHistory: true,
                        trendingSource: ["news", "social"],
                    });
                    returnInfo = new index_1.ReturnInfo({ categoryInfo: categoryInfoFlags });
                    q = new index_1.GetCategoryInfo({ uriOrUriList: uriList, returnInfo: returnInfo });
                    return [4 /*yield*/, er.execQuery(q)];
                case 2:
                    response = _a.sent();
                    expect(_.size(response)).toBe(_.size(uriList), "Expected " + _.size(uriList) + " categories");
                    _.each(response, function (item) {
                        expect(_.has(item, "id")).toBeTruthy("Category id is missing");
                        expect(_.has(item, "uri")).toBeTruthy("Category uri is missing");
                        expect(_.has(item, "parentUri")).toBeTruthy("Category parent uri is missing");
                        expect(_.has(item, "childrenUris")).toBeTruthy("Category children uris are missing");
                        expect(_.has(item, "trendingScore")).toBeTruthy("Category trending score is missing");
                        expect(_.has(item, "trendingHistory")).toBeTruthy("Category trending history is missing");
                        expect(_.has(item, "trendingScore.news")).toBeTruthy("Category trending score for news is missing");
                        expect(_.has(item, "trendingScore.social")).toBeTruthy("Category trending score for social is missing");
                        expect(_.has(item, "trendingHistory.news")).toBeTruthy("Category trending history for news is missing");
                        expect(_.has(item, "trendingHistory.social")).toBeTruthy("Category trending history for social is missing");
                    });
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=info.spec.js.map