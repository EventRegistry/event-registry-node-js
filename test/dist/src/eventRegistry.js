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
var axios_1 = require("axios");
var fs = require("fs");
var _ = require("lodash");
var moment = require("moment");
var Qs = require("qs");
var winston = require("winston");
var base_1 = require("./base");
var queryArticle_1 = require("./queryArticle");
var returnInfo_1 = require("./returnInfo");
/**
 * @class EventRegistry
 * Main class responsible for obtaining results form the Event Registry
 */
var EventRegistry = /** @class */ (function () {
    function EventRegistry(config) {
        if (config === void 0) { config = {}; }
        this.config = {
            host: "http://eventregistry.org",
            logging: false,
            minDelayBetweenRequests: 0.5,
            repeatFailedRequestCount: 2,
            verboseOutput: false,
        };
        this.lastQueryTime = 0;
        if (fs && fs.existsSync(this.config.settingsFName || "settings.json")) {
            var localConfig = JSON.parse(fs.readFileSync(this.config.settingsFName || "settings.json", "utf8"));
            _.extend(this.config, localConfig);
            console.info(localConfig);
            if (!_.isNil(config.apiKey)) {
                this.config.apiKey = config.apiKey;
            }
        }
        else {
            _.extend(this.config, config);
        }
        if (config.logging) {
            this.logger = winston.createLogger({
                level: "info",
                format: winston.format.json(),
                transports: [
                    new winston.transports.File({
                        filename: "logs/error.log",
                        level: "error",
                    }),
                    new winston.transports.File({ filename: "logs/info.log" }),
                ],
            });
        }
        this.config.minDelayBetweenRequests *= 1000;
        axios_1.default.defaults.baseURL = config.host;
        axios_1.default.interceptors.response.use(undefined, function (err) {
            // If config does not exist or the retry option is not set, reject
            if (!err.config || !err.config.retry) {
                return Promise.reject(err);
            }
            // Set the variable for keeping track of the retry count
            err.config.__retryCount = err.config.__retryCount || 0;
            // Check if we've maxed out the total number of retries
            if (err.config.__retryCount >= err.config.retry) {
                // Reject with the error
                return Promise.reject(err);
            }
            err.config.__retryCount += 1;
            return new Promise(function (resolve) {
                setTimeout(function () { return resolve(); }, err.config.retryDelay || 1);
            }).then(function () { return axios_1.default(err.config); });
        });
    }
    /**
     * Main method for executing the search queries.
     * @param query instance of Query class
     */
    EventRegistry.prototype.execQuery = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var params, request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = query.getQueryParams();
                        return [4 /*yield*/, this.jsonRequest(query.path, params)];
                    case 1:
                        request = _a.sent();
                        if (!_.has(request, "data") && this.config.verboseOutput) {
                            this.logger.error("Request did not return with the 'data' property.");
                        }
                        return [2 /*return*/, _.get(request, "data", {})];
                }
            });
        });
    };
    /**
     * Make a request for json data
     * @param path URL on Event Registry (e.g. "/json/article")
     * @param parameters Optional parameters to be included in the request
     */
    EventRegistry.prototype.jsonRequest = function (path, parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var request, current, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        current = moment.utc().milliseconds();
                        if (!(this.lastQueryTime && current - this.lastQueryTime < this.config.minDelayBetweenRequests)) return [3 /*break*/, 2];
                        return [4 /*yield*/, base_1.sleep(this.config.minDelayBetweenRequests - (current - this.lastQueryTime))];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.lastQueryTime = current;
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, axios_1.default.request({
                                url: path,
                                baseURL: this.config.host,
                                params: parameters,
                                paramsSerializer: function (params) {
                                    _.set(params, "apiKey", _this.config.apiKey);
                                    return Qs.stringify(params, { arrayFormat: "repeat" });
                                },
                                timeout: 600000,
                                responseType: "json",
                                maxRedirects: 5,
                                retry: this.config.repeatFailedRequestCount,
                            })];
                    case 4:
                        request = _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        // try to print out the error that should be passed by in case the server is down or responds with errors
                        if (this.config.verboseOutput) {
                            this.logger.error(_.get(error_1, "errno", error_1));
                        }
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/, request];
                }
            });
        });
    };
    /**
     * Return a list of concepts that contain the given prefix.
     * Returned matching concepts are sorted based on their frequency of occurrence in news (from most to least frequent)
     * @param prefix input text that should be contained in the concept
     * @param args Object which contains a host of optional parameters
     */
    EventRegistry.prototype.suggestConcepts = function (prefix, args) {
        if (args === void 0) { args = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, sources, _b, lang, _c, conceptLang, _d, page, _e, count, _f, returnInfo, params, request;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _a = args.sources, sources = _a === void 0 ? ["concepts"] : _a, _b = args.lang, lang = _b === void 0 ? "eng" : _b, _c = args.conceptLang, conceptLang = _c === void 0 ? "eng" : _c, _d = args.page, page = _d === void 0 ? 1 : _d, _e = args.count, count = _e === void 0 ? 20 : _e, _f = args.returnInfo, returnInfo = _f === void 0 ? new returnInfo_1.ReturnInfo() : _f;
                        if (page <= 0) {
                            throw new RangeError("page parameter should be above 0");
                        }
                        params = {
                            prefix: prefix,
                            source: sources,
                            lang: lang,
                            conceptLang: conceptLang,
                            page: page,
                            count: count,
                        };
                        params = _.extend({}, params, returnInfo.getParams());
                        return [4 /*yield*/, this.jsonRequest("/json/suggestConcepts", params)];
                    case 1:
                        request = _g.sent();
                        return [2 /*return*/, request.data];
                }
            });
        });
    };
    /**
     * Return a list of dmoz categories that contain the prefix
     * @param prefix input text that should be contained in the category name
     * @param args Object which contains a host of optional parameters
     */
    EventRegistry.prototype.suggestCategories = function (prefix, args) {
        if (args === void 0) { args = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, count, _c, returnInfo, params, request;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = args.page, page = _a === void 0 ? 1 : _a, _b = args.count, count = _b === void 0 ? 20 : _b, _c = args.returnInfo, returnInfo = _c === void 0 ? new returnInfo_1.ReturnInfo() : _c;
                        if (page <= 0) {
                            throw new RangeError("page parameter should be above 0");
                        }
                        params = { prefix: prefix, page: page, count: count };
                        params = _.extend({}, params, returnInfo.getParams());
                        return [4 /*yield*/, this.jsonRequest("/json/suggestCategories", params)];
                    case 1:
                        request = _d.sent();
                        return [2 /*return*/, request.data];
                }
            });
        });
    };
    /**
     * Return a list of news sources that match the prefix
     * @param prefix input text that should be contained in the source name or uri
     * @param args Object which contains a host of optional parameters
     */
    EventRegistry.prototype.suggestNewsSources = function (prefix, args) {
        if (args === void 0) { args = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, count, request;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = args.page, page = _a === void 0 ? 1 : _a, _b = args.count, count = _b === void 0 ? 20 : _b;
                        if (page <= 0) {
                            throw new RangeError("page parameter should be above 0");
                        }
                        return [4 /*yield*/, this.jsonRequest("/json/suggestSources", { prefix: prefix, page: page, count: count })];
                    case 1:
                        request = _c.sent();
                        return [2 /*return*/, request.data];
                }
            });
        });
    };
    /**
     * Return a list of news source groups that match the prefix
     * @param prefix input text that should be contained in the source group name or uri
     * @param args Object which contains a host of optional parameters
     */
    EventRegistry.prototype.suggestSourceGroups = function (prefix, args) {
        if (args === void 0) { args = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, count, request;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = args.page, page = _a === void 0 ? 1 : _a, _b = args.count, count = _b === void 0 ? 20 : _b;
                        if (page <= 0) {
                            throw new RangeError("page parameter should be above 0");
                        }
                        return [4 /*yield*/, this.jsonRequest("/json/suggestSourceGroups", { prefix: prefix, page: page, count: count })];
                    case 1:
                        request = _c.sent();
                        return [2 /*return*/, request.data];
                }
            });
        });
    };
    /**
     * Return a list of geo locations (cities or countries) that contain the prefix
     * @param prefix input text that should be contained in the location name
     * @param args Object which contains a host of optional parameters
     */
    EventRegistry.prototype.suggestLocations = function (prefix, args) {
        if (args === void 0) { args = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, sources, _b, lang, _c, count, _d, countryUri, _e, sortByDistanceTo, _f, returnInfo, params, request;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _a = args.sources, sources = _a === void 0 ? ["place", "country"] : _a, _b = args.lang, lang = _b === void 0 ? "eng" : _b, _c = args.count, count = _c === void 0 ? 20 : _c, _d = args.countryUri, countryUri = _d === void 0 ? "" : _d, _e = args.sortByDistanceTo, sortByDistanceTo = _e === void 0 ? undefined : _e, _f = args.returnInfo, returnInfo = _f === void 0 ? new returnInfo_1.ReturnInfo() : _f;
                        params = {
                            prefix: prefix,
                            count: count,
                            source: sources,
                            lang: lang,
                            countryUri: countryUri,
                        };
                        params = _.extend({}, params, returnInfo.getParams());
                        if (sortByDistanceTo) {
                            if (!_.isArray(sortByDistanceTo)) {
                                throw new Error("sortByDistanceTo has to contain a tuple with latitude and longitude of the location");
                            }
                            if (_.size(sortByDistanceTo) !== 2) {
                                throw new Error("The sortByDistanceTo should contain two numbers");
                            }
                            params["closeToLat"] = sortByDistanceTo[0];
                            params["closeToLon"] = sortByDistanceTo[1];
                        }
                        return [4 /*yield*/, this.jsonRequest("/json/suggestLocations", params)];
                    case 1:
                        request = _g.sent();
                        return [2 /*return*/, request.data];
                }
            });
        });
    };
    /**
     * Return a list of geo locations (cities or places) that are close to the provided (lat, long) values
     * @param latitude latitude part of the coordinate
     * @param longitude longitude part of the coordinate
     * @param radiusKm radius in kilometers around the coordinates inside which the locations should be returned
     * @param args Object which contains a host of optional parameters
     */
    EventRegistry.prototype.suggestLocationsAtCoordinate = function (latitude, longitude, radiusKm, args) {
        if (args === void 0) { args = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, limitToCities, _b, lang, _c, count, _d, ignoreNonWiki, _e, returnInfo, params, request;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _a = args.limitToCities, limitToCities = _a === void 0 ? false : _a, _b = args.lang, lang = _b === void 0 ? "eng" : _b, _c = args.count, count = _c === void 0 ? 20 : _c, _d = args.ignoreNonWiki, ignoreNonWiki = _d === void 0 ? true : _d, _e = args.returnInfo, returnInfo = _e === void 0 ? new returnInfo_1.ReturnInfo() : _e;
                        if (!_.isNumber(latitude)) {
                            throw new Error("The 'latitude' should be a number");
                        }
                        if (!_.isNumber(longitude)) {
                            throw new Error("The 'longitude' should be a number");
                        }
                        params = {
                            action: "getLocationsAtCoordinate",
                            lat: latitude,
                            lon: longitude,
                            radius: radiusKm,
                            limitToCities: limitToCities,
                            count: count,
                            lang: lang,
                        };
                        params = _.extend({}, params, returnInfo.getParams());
                        return [4 /*yield*/, this.jsonRequest("/json/suggestLocations", params)];
                    case 1:
                        request = _f.sent();
                        return [2 /*return*/, request.data];
                }
            });
        });
    };
    /**
     * Return a list of news sources that are close to the provided (lat, long) values
     * @param latitude latitude part of the coordinate
     * @param longitude longitude part of the coordinate
     * @param radiusKm radius in kilometers around the coordinates inside which the news sources should be located
     * @param count number of returned suggestions
     */
    EventRegistry.prototype.suggestSourcesAtCoordinate = function (latitude, longitude, radiusKm, count) {
        if (count === void 0) { count = 20; }
        return __awaiter(this, void 0, void 0, function () {
            var params, request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!_.isNumber(latitude)) {
                            throw new Error("The 'latitude' should be a number");
                        }
                        if (!_.isNumber(longitude)) {
                            throw new Error("The 'longitude' should be a number");
                        }
                        params = {
                            action: "getSourcesAtCoordinate",
                            lat: latitude,
                            lon: longitude,
                            radius: radiusKm,
                            count: count,
                        };
                        return [4 /*yield*/, this.jsonRequest("/json/suggestSources", params)];
                    case 1:
                        request = _a.sent();
                        return [2 /*return*/, request.data];
                }
            });
        });
    };
    /**
     * Return a list of news sources that are close to the provided (lat, long) values
     * @param conceptUri concept that represents a geographic location for which we would like to obtain a list of sources located at the place
     * @param args Object which contains a host of optional parameters
     */
    EventRegistry.prototype.suggestSourcesAtPlace = function (conceptUri, args) {
        if (args === void 0) { args = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, count, params, request;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = args.page, page = _a === void 0 ? 1 : _a, _b = args.count, count = _b === void 0 ? 20 : _b;
                        params = {
                            action: "getSourcesAtPlace",
                            conceptUri: conceptUri,
                            page: page,
                            count: count,
                        };
                        return [4 /*yield*/, this.jsonRequest("/json/suggestSources", params)];
                    case 1:
                        request = _c.sent();
                        return [2 /*return*/, request.data];
                }
            });
        });
    };
    /**
     * Return a list of concept classes that match the given prefix
     * @param prefix input text that should be contained in the category name
     * @param args Object which contains a host of optional parameters
     */
    EventRegistry.prototype.suggestConceptClasses = function (prefix, args) {
        if (args === void 0) { args = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, lang, _b, conceptLang, _c, source, _d, page, _e, count, _f, returnInfo, params, request;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _a = args.lang, lang = _a === void 0 ? "eng" : _a, _b = args.conceptLang, conceptLang = _b === void 0 ? "eng" : _b, _c = args.source, source = _c === void 0 ? ["dbpedia", "custom"] : _c, _d = args.page, page = _d === void 0 ? 1 : _d, _e = args.count, count = _e === void 0 ? 20 : _e, _f = args.returnInfo, returnInfo = _f === void 0 ? new returnInfo_1.ReturnInfo() : _f;
                        if (page < 1) {
                            throw new Error("page parameter should be above 0");
                        }
                        params = { prefix: prefix, lang: lang, conceptLang: conceptLang, source: source, page: page, count: count };
                        params = _.extend({}, params, returnInfo.getParams());
                        return [4 /*yield*/, this.jsonRequest("/json/suggestConceptClasses", params)];
                    case 1:
                        request = _g.sent();
                        return [2 /*return*/, request.data];
                }
            });
        });
    };
    /**
     * Return a list of custom concepts that contain the given prefix.
     * Custom concepts are the things (indicators, stock prices, ...)
     * for which we import daily trending values that can be obtained using GetCounts class
     * @param prefix input text that should be contained in the concept name
     * @param args Object which contains a host of optional parameters
     */
    EventRegistry.prototype.suggestCustomConcepts = function (prefix, args) {
        if (args === void 0) { args = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, lang, _b, conceptLang, _c, page, _d, count, _e, returnInfo, params, request;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _a = args.lang, lang = _a === void 0 ? "eng" : _a, _b = args.conceptLang, conceptLang = _b === void 0 ? "eng" : _b, _c = args.page, page = _c === void 0 ? 1 : _c, _d = args.count, count = _d === void 0 ? 20 : _d, _e = args.returnInfo, returnInfo = _e === void 0 ? new returnInfo_1.ReturnInfo() : _e;
                        if (page < 1) {
                            throw new Error("page parameter should be above 0");
                        }
                        params = { prefix: prefix, lang: lang, conceptLang: conceptLang, page: page, count: count };
                        params = _.extend({}, params, returnInfo.getParams());
                        return [4 /*yield*/, this.jsonRequest("/json/suggestCustomConcepts", params)];
                    case 1:
                        request = _f.sent();
                        return [2 /*return*/, request.data];
                }
            });
        });
    };
    /**
     * return a concept uri that is the best match for the given concept label
     * if there are multiple matches for the given conceptLabel,
     * they are sorted based on their frequency of occurrence in news (most to least frequent)
     * @param conceptLabel partial or full name of the concept for which to return the concept uri
     * @param args Object which contains a host of optional parameters
     */
    EventRegistry.prototype.getConceptUri = function (conceptLabel, args) {
        if (args === void 0) { args = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, lang, _b, sources, matches;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = args.lang, lang = _a === void 0 ? "eng" : _a, _b = args.sources, sources = _b === void 0 ? ["concepts"] : _b;
                        return [4 /*yield*/, this.suggestConcepts(conceptLabel, { lang: lang, sources: sources })];
                    case 1:
                        matches = _c.sent();
                        return [2 /*return*/, _.get(_.first(matches), "uri", undefined)];
                }
            });
        });
    };
    /**
     * Return a location uri that is the best match for the given location label
     * @param locationLabel partial or full location name for which to return the location uri
     * @param args Object which contains a host of optional parameters
     */
    EventRegistry.prototype.getLocationUri = function (locationLabel, args) {
        if (args === void 0) { args = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, lang, _b, sources, _c, countryUri, _d, sortByDistanceTo, matches;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _a = args.lang, lang = _a === void 0 ? "eng" : _a, _b = args.sources, sources = _b === void 0 ? ["place", "country"] : _b, _c = args.countryUri, countryUri = _c === void 0 ? undefined : _c, _d = args.sortByDistanceTo, sortByDistanceTo = _d === void 0 ? undefined : _d;
                        return [4 /*yield*/, this.suggestLocations(locationLabel, { lang: lang, sources: sources, countryUri: countryUri, sortByDistanceTo: sortByDistanceTo })];
                    case 1:
                        matches = _e.sent();
                        return [2 /*return*/, _.get(_.first(matches), "wikiUri", undefined)];
                }
            });
        });
    };
    /**
     * Return a category uri that is the best match for the given label
     * @param categoryLabel partial or full name of the category for which to return category uri
     */
    EventRegistry.prototype.getCategoryUri = function (categoryLabel) {
        return __awaiter(this, void 0, void 0, function () {
            var matches;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.suggestCategories(categoryLabel)];
                    case 1:
                        matches = _a.sent();
                        return [2 /*return*/, _.get(_.first(matches), "uri", undefined)];
                }
            });
        });
    };
    /**
     * Return the news source that best matches the source name
     * @param sourceName partial or full name of the source or source uri for which to return source uri
     */
    EventRegistry.prototype.getNewsSourceUri = function (sourceName) {
        return __awaiter(this, void 0, void 0, function () {
            var matches;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.suggestNewsSources(sourceName)];
                    case 1:
                        matches = _a.sent();
                        return [2 /*return*/, _.get(_.first(matches), "uri", undefined)];
                }
            });
        });
    };
    /**
     * Return the URI of the source group that best matches the name
     * @param sourceGroupName partial or full name of the source group
     */
    EventRegistry.prototype.getSourceGroupUri = function (sourceGroupName) {
        return __awaiter(this, void 0, void 0, function () {
            var matches;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.suggestSourceGroups(sourceGroupName)];
                    case 1:
                        matches = _a.sent();
                        return [2 /*return*/, _.get(_.first(matches), "uri", undefined)];
                }
            });
        });
    };
    /**
     * Return a uri of the concept class that is the best match for the given label
     * @param classLabel partial or full name of the concept class for which to return class uri
     * @param lang language in which the class label is specified
     */
    EventRegistry.prototype.getConceptClassUri = function (classLabel, lang) {
        if (lang === void 0) { lang = "eng"; }
        return __awaiter(this, void 0, void 0, function () {
            var matches;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.suggestConceptClasses(classLabel, { lang: lang })];
                    case 1:
                        matches = _a.sent();
                        return [2 /*return*/, _.get(_.first(matches), "uri", undefined)];
                }
            });
        });
    };
    /**
     * Return detailed information about a particular concept
     * @param conceptUri uri of the concept
     * @param returnInfo what details about the concept should be included in the returned information
     */
    EventRegistry.prototype.getConceptInfo = function (conceptUri, returnInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var conceptInfo, params, request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!returnInfo) {
                            conceptInfo = new returnInfo_1.ConceptInfoFlags({ synonyms: true, image: true, description: true });
                            returnInfo = new returnInfo_1.ReturnInfo({ conceptInfo: conceptInfo });
                        }
                        params = {
                            uri: conceptUri,
                            action: "getInfo",
                        };
                        params = _.extend({}, params, returnInfo.getParams());
                        return [4 /*yield*/, this.jsonRequest("/json/concept", params)];
                    case 1:
                        request = _a.sent();
                        return [2 /*return*/, request.data];
                }
            });
        });
    };
    /**
     * Return a custom concept uri that is the best match for the given custom concept label
     * note that for the custom concepts we don't have a sensible way of sorting the candidates that match the label
     * if multiple candidates match the label we cannot guarantee which one will be returned
     * @param label label of the custom concept
     * @param lang language in which the label is specified
     */
    EventRegistry.prototype.getCustomConceptUri = function (label, lang) {
        if (lang === void 0) { lang = "eng"; }
        return __awaiter(this, void 0, void 0, function () {
            var matches;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.suggestCustomConcepts(label, { lang: lang })];
                    case 1:
                        matches = _a.sent();
                        return [2 /*return*/, _.get(_.first(matches), "uri", undefined)];
                }
            });
        });
    };
    /**
     * Get some stats about recently imported articles and events
     */
    EventRegistry.prototype.getRecentStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.jsonRequest("/json/overview", { action: "getRecentStats" })];
                    case 1:
                        request = _a.sent();
                        return [2 /*return*/, request.data];
                }
            });
        });
    };
    /**
     * get total statistics about all imported articles, concepts, events as well as daily counts for these
     */
    EventRegistry.prototype.getStats = function (args) {
        if (args === void 0) { args = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _.defaults(args, { addDailyArticles: false, addDailyAnnArticles: false, addDailyDuplArticles: false, addDailyEvents: false });
                        return [4 /*yield*/, this.jsonRequest("/json/overview", _.extend({}, { action: "getStats" }, args))];
                    case 1:
                        request = _a.sent();
                        return [2 /*return*/, request.data];
                }
            });
        });
    };
    /**
     * If you have article urls and you want to query them in ER you first have to obtain their uris in the ER.
     * @param articleUrls a single article url or a list of article urls
     */
    EventRegistry.prototype.getArticleUris = function (articleUrls) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!_.isArray(articleUrls) && !_.isString(articleUrls)) {
                            throw new Error("Expected a single article url or a list of urls");
                        }
                        return [4 /*yield*/, this.jsonRequest("/json/articleMapper", { articleUrl: articleUrls })];
                    case 1:
                        request = _a.sent();
                        return [2 /*return*/, request.data];
                }
            });
        });
    };
    /**
     * Return information about the latest imported article
     */
    EventRegistry.prototype.getLatestArticle = function (returnInfo) {
        if (returnInfo === void 0) { returnInfo = new returnInfo_1.ReturnInfo(); }
        return __awaiter(this, void 0, void 0, function () {
            var stats, latestId, q, requestArticleInfo, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRecentStats()];
                    case 1:
                        stats = _a.sent();
                        latestId = (stats["totalArticleCount"] - 1) + "";
                        q = new queryArticle_1.QueryArticle(latestId);
                        requestArticleInfo = new queryArticle_1.RequestArticleInfo(returnInfo);
                        return [4 /*yield*/, this.execQuery(q)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, _.get(response[_.first(_.keys(response))], "info", undefined)];
                }
            });
        });
    };
    /**
     * Return information about the latest imported article
     */
    EventRegistry.prototype.getSourceGroups = function () {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.jsonRequest("/json/sourceGroup", { action: "getSourceGroups" })];
                    case 1:
                        request = _a.sent();
                        return [2 /*return*/, request.data];
                }
            });
        });
    };
    /**
     * Return info about the source group
     */
    EventRegistry.prototype.getSourceGroup = function (sourceGroupUri) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.jsonRequest("/json/sourceGroup", { action: "getSourceGroupInfo", uri: sourceGroupUri })];
                    case 1:
                        request = _a.sent();
                        return [2 /*return*/, request.data];
                }
            });
        });
    };
    return EventRegistry;
}());
exports.EventRegistry = EventRegistry;
/**
 * @class ArticleMapper
 * Create instance of article mapper it will map from article urls to article uris
 * the mappings can be remembered so it will not repeat requests for the same article urls
 */
var ArticleMapper = /** @class */ (function () {
    function ArticleMapper(er, rememberMapping) {
        if (rememberMapping === void 0) { rememberMapping = true; }
        this.articleUrlToUri = {};
        this.rememberMappings = true;
        this.er = er;
        this.rememberMappings = rememberMapping;
    }
    /**
     * Given the article url, return an array with 0, 1 or more article uris.
     * Not all returned article uris are necessarily valid anymore.
     * For news sources of lower importance we remove the duplicated articles and just keep the latest content
     * @param articleUrl string containing the article url
     */
    ArticleMapper.prototype.getArticleUri = function (articleUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var response, value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (_.has(this.articleUrlToUri, articleUrl)) {
                            return [2 /*return*/, _.get(this.articleUrlToUri, articleUrl)];
                        }
                        return [4 /*yield*/, this.er.getArticleUris(articleUrl)];
                    case 1:
                        response = _a.sent();
                        value = _.get(response, articleUrl, undefined);
                        if (this.rememberMappings && value) {
                            this.articleUrlToUri[articleUrl] = value;
                        }
                        return [2 /*return*/, value];
                }
            });
        });
    };
    return ArticleMapper;
}());
exports.ArticleMapper = ArticleMapper;
//# sourceMappingURL=eventRegistry.js.map