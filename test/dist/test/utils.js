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
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var index_1 = require("../src/index");
var queryArticles_1 = require("../src/queryArticles");
var Utils = /** @class */ (function () {
    function Utils() {
        this.articleInfo = new index_1.ArticleInfoFlags({ bodyLen: -1,
            concepts: true,
            storyUri: true,
            duplicateList: true,
            originalArticle: true,
            categories: true,
            videos: true,
            image: true,
            location: true,
            extractedDates: true,
            socialScore: true,
            details: true,
        });
        this.sourceInfo = new index_1.SourceInfoFlags({ description: true,
            location: true,
            ranking: true,
            articleCount: true,
            sourceGroups: true,
            details: true,
        });
        this.conceptInfo = new index_1.ConceptInfoFlags({ type: ["entities"],
            lang: ["eng", "spa"],
            synonyms: true,
            image: true,
            description: true,
            details: true,
            conceptClassMembership: true,
            trendingScore: true,
            trendingHistory: true,
            maxConceptsPerType: 50,
        });
        this.locationInfo = new index_1.LocationInfoFlags({ wikiUri: true,
            label: true,
            geoNamesId: true,
            geoLocation: true,
            population: true,
            countryArea: true,
            countryDetails: true,
            countryContinent: true,
            placeFeatureCode: true,
            placeCountry: true,
        });
        this.categoryInfo = new index_1.CategoryInfoFlags({ parentUri: true, childrenUris: true, trendingScore: true, trendingHistory: true });
        this.eventInfo = new index_1.EventInfoFlags({ commonDates: true, stories: true, socialScore: true, details: true, imageCount: 2 });
        this.storyInfo = new index_1.StoryInfoFlags({ categories: true,
            date: true,
            concepts: true,
            title: true,
            summary: true,
            medoidArticle: true,
            commonDates: true,
            socialScore: true,
            imageCount: 2,
            details: true,
        });
        this.returnInfo = new index_1.ReturnInfo({ articleInfo: this.articleInfo,
            sourceInfo: this.sourceInfo,
            conceptInfo: this.conceptInfo,
            locationInfo: this.locationInfo,
            categoryInfo: this.categoryInfo,
            eventInfo: this.eventInfo,
            storyInfo: this.storyInfo,
        });
    }
    Utils.initAPI = function () {
        return new index_1.EventRegistry();
    };
    Utils.prototype.getArticlesQueryUriListForComplexQuery = function (er, query, cq) {
        return __awaiter(this, void 0, void 0, function () {
            var q;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        q = queryArticles_1.QueryArticles.initWithComplexQuery(query, cq);
                        return [4 /*yield*/, this.getQueryUriListForQueryArticles(er, q)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Utils.prototype.getEventsQueryUriListForComplexQuery = function (er, query, cq) {
        return __awaiter(this, void 0, void 0, function () {
            var q;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        q = index_1.QueryEvents.initWithComplexQuery(query, cq);
                        return [4 /*yield*/, this.getQueryUriListForQueryEvents(er, q)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Utils.prototype.getQueryUriListForQueryArticles = function (er, q) {
        return __awaiter(this, void 0, void 0, function () {
            var requestArticlesUriList, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requestArticlesUriList = new index_1.RequestArticlesUriList({ count: 50000 });
                        q.setRequestedResult(requestArticlesUriList);
                        return [4 /*yield*/, er.execQuery(q)];
                    case 1:
                        response = _a.sent();
                        if (_.has(response, "error")) {
                            throw new Error(_.get(response, "error"));
                        }
                        if (_.get(response, "info", "") === "No results match the search conditions.") {
                            console.warn("One of the queries had no results to match the specified search conditions");
                        }
                        return [2 /*return*/, _.get(response, "uriList")];
                }
            });
        });
    };
    Utils.prototype.getQueryUriListForQueryEvents = function (er, q) {
        return __awaiter(this, void 0, void 0, function () {
            var requestEventsUriList, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requestEventsUriList = new index_1.RequestEventsUriList({ count: 50000 });
                        q.setRequestedResult(requestEventsUriList);
                        return [4 /*yield*/, er.execQuery(q)];
                    case 1:
                        response = _a.sent();
                        if (_.has(response, "error")) {
                            throw new Error(_.get(response, "error"));
                        }
                        if (_.get(response, "info", "") === "No results match the search conditions.") {
                            console.warn("One of the queries had no results to match the specified search conditions");
                        }
                        return [2 /*return*/, _.get(response, "uriList")];
                }
            });
        });
    };
    Utils.prototype.ensureValidConcept = function (concept) {
        var result = { pass: true };
        var propertyNames = ["id", "uri", "label", "synonyms", "image", "details", "trendingScore"];
        result = this.validateProperties(concept, "concept", propertyNames);
        // TODO: Is 'wiki' part of the entity types?
        if (!_.includes(["person", "loc", "org", "wiki"], _.get(concept, "type"))) {
            result = { pass: false, message: "Expected concept to be an entity type, but got " + _.get(concept, "type") };
        }
        if (_.has(concept, "location") && !_.isNil(_.get(concept, "location"))) {
            result = this.ensureValidLocation(_.get(concept, "location"));
        }
        return result;
    };
    Utils.prototype.ensureValidLocation = function (location) {
        var result = { pass: true };
        var propertyNames = ["wikiUri", "label", "lat", "long", "geoNamesId", "population"];
        result = this.validateProperties(location, "location", propertyNames);
        switch (_.get(location, "type")) {
            case "country":
                result = this.validateProperties(location, "location", ["area", "code2", "code3", "webExt", "continent"]);
                break;
            case "place":
                result = this.validateProperties(location, "location", ["featureCode", "country"]);
                break;
        }
        return result;
    };
    Utils.prototype.ensureValidArticle = function (article) {
        var _this = this;
        var result = { pass: true };
        var propertyNames = ["id",
            "url",
            "uri",
            "title",
            "body",
            "source",
            "details",
            "location",
            "duplicateList",
            "originalArticle",
            "time",
            "date",
            "categories",
            "lang",
            "extractedDates",
            "concepts",
            "details",
        ];
        result = this.validateProperties(article, "article", propertyNames);
        _.each(_.get(article, "concepts", []), function (concept) {
            result = _this.ensureValidConcept(concept);
        });
        if (!_.get(article, "isDuplicate") && !_.has(article, "eventUri")) {
            result = { pass: false, message: "Non duplicates should have event uris " };
        }
        return result;
    };
    Utils.prototype.ensureValidEvent = function (event) {
        var _this = this;
        var result = { pass: true };
        var propertyNames = ["uri",
            "title",
            "summary",
            "articleCounts",
            "concepts",
            "categories",
            "location",
            "eventDate",
            "commonDates",
            "stories",
            "socialScore",
            "details",
            "images",
        ];
        result = this.validateProperties(event, "event", propertyNames);
        _.each(_.get(event, "concepts", []), function (concept) {
            result = _this.ensureValidConcept(concept);
        });
        _.each(_.get(event, "stories", []), function (story) {
            result = _this.ensureValidStory(story);
        });
        _.each(_.get(event, "categories", []), function (category) {
            result = _this.ensureValidCategory(category);
        });
        if (_.has(event, "location") && !_.isNil(_.get(event, "location"))) {
            result = this.ensureValidLocation(_.get(event, "location"));
        }
        return result;
    };
    Utils.prototype.ensureValidStory = function (story) {
        var propertyNames = ["uri",
            "title",
            "summary",
            "concepts",
            "categories",
            "location",
            "storyDate",
            "averageDate",
            "commonDates",
            "socialScore",
            "details",
            "images",
        ];
        var result = this.validateProperties(story, "story", propertyNames);
        if (_.has(story, "location") && !_.isNil(_.get(story, "location"))) {
            result = this.ensureValidLocation(_.get(story, "location"));
        }
        return result;
    };
    Utils.prototype.ensureValidGeneralArticleList = function (articleList) {
        var _this = this;
        var result = { pass: true };
        if (!_.has(articleList, "articles")) {
            result = { pass: false, message: "Expected to get 'articles'" };
        }
        _.each(_.get(articleList, "articles.results", []), function (article) {
            result = _this.ensureValidArticle(article);
        });
        return result;
    };
    Utils.prototype.ensureValidGeneralEventList = function (eventList) {
        var _this = this;
        var result = { pass: true };
        if (!_.has(eventList, "events")) {
            result = { pass: false, message: "Expected to get 'events'" };
        }
        _.each(_.get(eventList, "events.results", []), function (event) {
            result = _this.ensureValidEvent(event);
        });
        return result;
    };
    Utils.prototype.ensureValidCategory = function (category) {
        var propertyNames = ["id", "uri", "parentUri", "trendingScore"];
        return this.validateProperties(category, "category", propertyNames);
    };
    Utils.prototype.ensureValidSource = function (source) {
        var propertyNames = ["id", "uri", "location", "ranking", "articleCount", "sourceGroups", "details"];
        return this.validateProperties(source, "source", propertyNames);
    };
    Utils.prototype.ensureItemHasConcept = function (item, conceptUri) {
        if (!_.has(item, "concepts")) {
            return { pass: false, message: "Item doesn't contain concept array" };
        }
        if (!_.find(_.get(item, "concepts", []), function (_a) {
            var uri = _a.uri;
            return uri === conceptUri;
        })) {
            return { pass: false, message: "Item doesn't contain " + conceptUri };
        }
        return { pass: true };
    };
    Utils.prototype.ensureItemHasCategory = function (item, categoryUri) {
        if (!_.has(item, "categories")) {
            return { pass: false, message: "Item doesn't contain categories array" };
        }
        if (!_.some(_.get(item, "categories", []), function (category) { return _.includes(_.get(category, "uri"), categoryUri); })) {
            return { pass: false, message: "Item doesn't contain " + categoryUri };
        }
        return { pass: true };
    };
    Utils.prototype.ensureItemHasSource = function (item, sourceUri) {
        if (_.get(item, "source.uri") !== sourceUri) {
            return { pass: false, message: "Source is not '" + sourceUri + "'" };
        }
        return { pass: true };
    };
    Utils.prototype.ensureArticleBodyContainsText = function (article, text) {
        if (!_.has(article, "body")) {
            return { pass: false, message: "Article did not contain body" };
        }
        if (!this.doesContainText(_.get(article, "body", ""), text)) {
            return { pass: false, message: "\"Article body did not contain text '" + text + "'" };
        }
        return { pass: true };
    };
    Utils.prototype.validateProperties = function (item, objectName, propertyNames) {
        for (var _i = 0, propertyNames_1 = propertyNames; _i < propertyNames_1.length; _i++) {
            var propName = propertyNames_1[_i];
            if (!_.has(item, propName)) {
                return { pass: false, message: "Property '" + propName + "' was expected in a " + objectName + "." };
            }
        }
        return { pass: true };
    };
    Utils.prototype.doesContainText = function (text, searchQuery) {
        return _.includes(_.deburr(_.toLower(text)), _.deburr(_.toLower(searchQuery)));
    };
    return Utils;
}());
exports.Utils = Utils;
var utils = new Utils();
beforeEach(function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
    jasmine.addMatchers({
        toBeValidConcept: function () {
            return {
                compare: function (concept) {
                    return utils.ensureValidConcept(concept);
                },
            };
        },
        toBeValidArticle: function () {
            return {
                compare: function (article) {
                    return utils.ensureValidArticle(article);
                },
            };
        },
        toBeValidEvent: function () {
            return {
                compare: function (event) {
                    return utils.ensureValidEvent(event);
                },
            };
        },
        toBeValidGeneralEventList: function () {
            return {
                compare: function (eventList) {
                    return utils.ensureValidGeneralEventList(eventList);
                },
            };
        },
        toBeValidStory: function () {
            return {
                compare: function (story) {
                    return utils.ensureValidStory(story);
                },
            };
        },
        toBeValidGeneralArticleList: function () {
            return {
                compare: function (articleList) {
                    return utils.ensureValidGeneralArticleList(articleList);
                },
            };
        },
        toBeValidCategory: function () {
            return {
                compare: function (category) {
                    return utils.ensureValidCategory(category);
                },
            };
        },
        toBeValidSource: function () {
            return {
                compare: function (source) {
                    return utils.ensureValidSource(source);
                },
            };
        },
        toContainConcept: function () {
            return {
                compare: function (item, conceptUri) {
                    return utils.ensureItemHasConcept(item, conceptUri);
                },
            };
        },
        toContainSource: function () {
            return {
                compare: function (item, sourceUri) {
                    return utils.ensureItemHasSource(item, sourceUri);
                },
            };
        },
        toContainCategory: function () {
            return {
                compare: function (item, categoryUri) {
                    return utils.ensureItemHasCategory(item, categoryUri);
                },
            };
        },
        toContainBodyText: function () {
            return {
                compare: function (article, text) {
                    return utils.ensureArticleBodyContainsText(article, text);
                },
            };
        },
    });
});
//# sourceMappingURL=utils.js.map