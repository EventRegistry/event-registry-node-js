import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import * as fs from "fs";
import * as _ from "lodash";
import * as moment from "moment";
import Semaphore from "semaphore-async-await";
import * as winston from "winston";
import { ConceptInfoFlags, ReturnInfo } from "./returnInfo";
import { EventRegistryStatic } from "./types";
import { QueryParamsBase, sleep } from "./base";
import { QueryArticle } from "./queryArticle";
import { QueryArticles } from "./queryArticles";
import { QueryEvents } from "./queryEvents";
import { QueryEvent } from "./queryEvent";

/**
 * @class EventRegistry
 * Main class responsible for obtaining results form the Event Registry
 */
export class EventRegistry {
    public logger: winston.Logger;
    public requestLogger: winston.Logger;
    private config: EventRegistryStatic.Config = {
        host: "http://eventregistry.org",
        hostAnalytics: "http://analytics.eventregistry.org",
        logging: false,
        minDelayBetweenRequests: 1,
        repeatFailedRequestCount: 2,
        verboseOutput: false,
        allowUseOfArchive: true,
    };
    private headers = {};
    private dailyAvailableRequests = -1;
    private remainingAvailableRequests = -1;
    private lastQueryTime = 0;
    private _logRequests = false;
    private readonly lock: Semaphore;
    private readonly stopStatusCodes = [
        204,
        400,
        401,
        403,
        530,
    ];
    constructor(config: EventRegistryStatic.Config = {}) {
        this.lock = new Semaphore(1);
        if (!!config.apiKey && !!config.printHostInfo) {
            console.log("using user provided API key for making requests");
        }
        if (fs && fs.existsSync(this.config.settingsFName || "settings.json")) {
            const localConfig = JSON.parse(fs.readFileSync(this.config.settingsFName || "settings.json", "utf8"));
            _.extend(this.config, localConfig);
            if (!_.isNil(config.apiKey)) {
                if (!!config.printHostInfo) {
                    console.log("found apiKey in settings file which will be used for making requests");
                }
                this.config.apiKey = config.apiKey;
            }
        } else {
            _.extend(this.config, config);
        }
        if (this.config.logging) {
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

        this._logRequests = this.config.logging;
        this.initRequestLogger();

        if (_.isNil(this.config.apiKey)) {
            console.info("No API key was provided. You will be allowed to perform only a very limited number of requests per day.");
        }
        if (!!config.printHostInfo) {
            console.log(`Event Registry host: ${config.host}`);
            console.log(`Text analytics host: ${config.hostAnalytics}`);
        }
        this.config.minDelayBetweenRequests *= 1000;

        axios.interceptors.response.use(undefined, (err) => {
            // If config does not exist or the retry option is not set, reject
            if (!err.config || !err.config.retry) {
                return Promise.reject(err);
            }
            if (_.includes(this.stopStatusCodes, err.response.status)) {
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

            return new Promise((resolve) => {
                setTimeout(() => resolve(), err.config.retryDelay || 1);
            }).then(() => axios(err.config));
        });
    }

    /**
     * Should all requests be logged to a file or not?
     */
    public setLogging(logging: boolean) {
        this._logRequests = logging;
        this.initRequestLogger();
    }

    public get verboseOutput() {
        return this.config.verboseOutput;
    }

    /**
     * Main method for executing the search queries.
     * @param query instance of Query class
     */
    public async execQuery(query, allowUseOfArchive?: boolean) {
        const params = query.getQueryParams();
        const request = await this.jsonRequest(query.path, params, allowUseOfArchive);
        if (!_.has(request, "data") && this.config.verboseOutput) {
            this.logger.error("Request did not return with the 'data' property.");
        }
        return _.get(request, "data", {});
    }

    public async jsonRequestAnalytics(path: string, parameters?, headers?, cookies? ): Promise<AxiosResponse> {
        let request;
        await this.lock.acquire();
        try {
            _.set(parameters, "apiKey", this.config.apiKey);
            const args = {
                url: path,
                method: "POST",
                baseURL: this.config.hostAnalytics,
                data: parameters,
                timeout: 600000,
                responseType: "json",
                maxRedirects: 5,
            } as AxiosRequestConfig;
            if (!!headers) {
                _.set(args, "headers", headers);
            }
            if (!!cookies) {
                const cookieString = Object.keys(cookies).map((key) => key + "=" + cookies[key]).join(";") + ";";
                _.set(args, "headers.Cookie", cookieString);
            }
            request = await axios.request(args);
            this.headers = _.get(request, "headers", {});
            if (_.get(request, "status") !== 200) {
                throw new Error(_.get(request, "statusText"));
            }
            const errorMessage = _.get(request, "data.error", "");
            if (errorMessage) {
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error("Event Registry Analytics exception while executing the request.");
            request = { data: {error} };
            if (this.config.verboseOutput) {
                if (error && error.stack && error.message) {
                    console.error(error.message);
                } else {
                    console.error(`${_.get(error, "response.status")}: ${_.get(error, "response.statusText")} => ${_.get(error, "response.data")}`);
                }
            }
            // try to print out the error that should be passed by in case the server is down or responds with errors
            if (this.config.logging) {
                this.logger.error(_.get(error, "errno", error));
            }
        } finally {
            this.lock.release();
        }
        return request;
    }

    /**
     * Make a request for json data
     * @param path url on er (e.g. "/api/v1/article")
     * @param parameters Optional parameters to be included in the request
     */
    public async jsonRequest(path: string, parameters?, allowUseOfArchive = this.config.allowUseOfArchive) {
        let request;
        const current = moment.utc().milliseconds();
        if (this.lastQueryTime && current - this.lastQueryTime < this.config.minDelayBetweenRequests) {
            await sleep(this.config.minDelayBetweenRequests - (current - this.lastQueryTime) );
        }
        await this.lock.acquire();
        if (this._logRequests) {
            if (!_.isEmpty(parameters)) {
                this.requestLogger.info("# " + JSON.stringify(parameters) + "\n");
            }
            this.requestLogger.info(path + "\n\n");
        }
        this.lastQueryTime = current;
        try {
            _.set(parameters, "apiKey", this.config.apiKey);
            if (!allowUseOfArchive) {
                _.set(parameters, "forceMaxDataTimeWindow", 31);
            }
            request = await axios.request({
                url: path,
                method: "POST",
                baseURL: this.config.host,
                data: parameters,
                timeout: 600000,
                responseType: "json",
                maxRedirects: 5,
                retry: this.config.repeatFailedRequestCount,
            } as any);
            this.headers = _.get(request, "headers", {});
            if (_.get(request, "status") !== 200) {
                throw new Error(_.get(request, "statusText"));
            }
            if (this.getLastHeader("warning")) {
                console.warn(`WARNING: ${this.getLastHeader("warning")}`);
            }
            this.dailyAvailableRequests = _.toNumber(this.getLastHeader("x-ratelimit-limit", "-1"));
            this.remainingAvailableRequests = _.toNumber(this.getLastHeader("x-ratelimit-remaining", "-1"));
            const errorMessage = _.get(request, "data.error", "");
            if (errorMessage) {
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error("Event Registry exception while executing the request.");
            request = { data: {error} };
            // try to print out the error that should be passed by in case the server is down or responds with errors
            if (this.config.verboseOutput) {
                if (error && error.stack && error.message) {
                    console.error(error.message);
                } else {
                    console.error(`${_.get(error, "response.status")}: ${_.get(error, "response.statusText")} => ${_.get(error, "response.data")}`);
                }
            }
            if (this.config.logging) {
                this.logger.error(_.get(error, "errno", error));
            }
        } finally {
            this.lock.release();
        }
        return request;
    }

    /**
     * get the number of requests that are still available for the user today. Information is only accessible after you make some query.
     */
    public getRemainingAvailableRequests() {
        return this.remainingAvailableRequests;
    }

    /**
     * get the total number of requests that the user can make in a day. Information is only accessible after you make some query.
     */
    public getDailyAvailableRequests() {
        return this.dailyAvailableRequests;
    }

    /**
     * Return the headers returned in the response object of the last executed request
     */
    public getLastHeaders() {
        return this.headers;
    }

    /**
     * Get a value of the header headerName that was set in the headers in the last response object
     */
    public getLastHeader(headerName: string, dfltVal?) {
        return _.get(this.headers, headerName, dfltVal);
    }

    /**
     * print some statistics about the last executed request
     */
    public printLastReqStats() {
        console.log(`Tokens used by the request: ${this.getLastHeader("req-tokens")}`);
        console.log(`Performed action: ${this.getLastHeader("req-action")}`);
        console.log(`Was archive used for the query: ${this.getLastReqArchiveUse() ? "Yes" : "No"}`);
    }

    /**
     * return true or false depending on whether the last request used the archive or not
     */
    public getLastReqArchiveUse() {
        return this.getLastHeader("req-archive", "0") === "1";
    }

    /**
     * Return the number of used and total available tokens. Can be used at any time (also before making queries)
     */
    public async getUsageInfo(): Promise<EventRegistryStatic.UsageInfo> {
        const request = await this.jsonRequest("/api/v1/usage");
        return request.data;
    }

    public async getServiceStatus(): Promise<EventRegistryStatic.UsageInfo> {
        const request = await this.jsonRequest("/api/v1/getServiceStatus");
        return request.data;
    }

    public getUrl(query: QueryArticles | QueryArticle | QueryEvents | QueryEvent) {
        if (!(query instanceof QueryParamsBase)) {
            if (this.config.verboseOutput) {
                console.warn("query parameter should be an instance of a class that has Query as a base class, such as QueryArticles or QueryEvents");
            }
        }
        const allParams = query.getQueryParams();
        return this.config.host + query.path + "?" + _.join(_.map(_.keys(allParams), (key) => key + "=" + allParams[key]), "&");
    }

    /**
     * Return a list of concepts that contain the given prefix.
     * Returned matching concepts are sorted based on their frequency of occurrence in news (from most to least frequent)
     * @param prefix input text that should be contained in the concept
     * @param args Object which contains a host of optional parameters
     */
    public async suggestConcepts(prefix: string, args: EventRegistryStatic.SuggestConceptsArguments = {}) {
        const { sources = [ "concepts" ] as EventRegistryStatic.ConceptType[], lang = "eng", conceptLang = "eng", page = 1, count = 20, returnInfo = new ReturnInfo(), ...otherParams } = args;
        if (page <= 0) {
            throw new RangeError("page parameter should be above 0");
        }

        let params = {
            prefix: prefix,
            source: sources,
            lang: lang,
            conceptLang: conceptLang,
            page: page,
            count: count,
        };
        params = _.extend({}, params, otherParams, returnInfo.getParams());
        const request = await this.jsonRequest("/api/v1/suggestConceptsFast", params);
        return request.data;
    }

    /**
     * Return a list of dmoz categories that contain the prefix
     * @param prefix input text that should be contained in the category name
     * @param args Object which contains a host of optional parameters
     */
    public async suggestCategories(prefix: string, args: EventRegistryStatic.SuggestCategoriesArguments = {}) {
        const {page = 1, count = 20, returnInfo = new ReturnInfo(), ...otherParams} = args;
        if (page <= 0) {
            throw new RangeError("page parameter should be above 0");
        }
        let params = {prefix, page, count};
        params = _.extend({}, params, otherParams, returnInfo.getParams());
        const request = await this.jsonRequest("/api/v1/suggestCategoriesFast", params);
        return request.data;
    }

    /**
     * Return a list of news sources that match the prefix
     * @param prefix input text that should be contained in the source name or uri
     * @param args Object which contains a host of optional parameters
     */
    public async suggestNewsSources(prefix: string, args: EventRegistryStatic.SuggestNewsSourcesArguments = {}) {
        const {page = 1, count = 20, dataType = ["news", "pr", "blog"], ...otherParams} = args;
        if (page <= 0) {
            throw new RangeError("page parameter should be above 0");
        }
        const request = await this.jsonRequest("/api/v1/suggestSourcesFast", {prefix, page, dataType, count, ...otherParams});
        return request.data;
    }

    /**
     * Return a list of news source groups that match the prefix
     * @param prefix input text that should be contained in the source group name or uri
     * @param args Object which contains a host of optional parameters
     */
    public async suggestSourceGroups(prefix: string, args: EventRegistryStatic.SuggestSourceGroupsArguments = {}) {
        const {page = 1, count = 20, ...otherParams} = args;
        if (page <= 0) {
            throw new RangeError("page parameter should be above 0");
        }
        const request = await this.jsonRequest("/api/v1/suggestSourceGroups", {prefix, page, count, ...otherParams});
        return request.data;
    }

    /**
     * Return a list of geo locations (cities or countries) that contain the prefix
     * @param prefix input text that should be contained in the location name
     * @param args Object which contains a host of optional parameters
     */
    public async suggestLocations(prefix: string, args: EventRegistryStatic.SuggestLocationsArguments = {}) {
        const {
            sources = ["place", "country"],
            lang = "eng",
            count = 20,
            countryUri = "",
            sortByDistanceTo,
            returnInfo = new ReturnInfo(),
            ...otherParams
        } = args;
        let params = {
            prefix: prefix,
            count: count,
            source: sources,
            lang: lang,
            countryUri: countryUri,
        };
        params = _.extend({}, params, otherParams, returnInfo.getParams());
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
        const request = await this.jsonRequest("/api/v1/suggestLocationsFast", params);
        return request.data;
    }

    /**
     * Return a list of geo locations (cities or places) that are close to the provided (lat, long) values
     * @param latitude latitude part of the coordinate
     * @param longitude longitude part of the coordinate
     * @param radiusKm radius in kilometers around the coordinates inside which the locations should be returned
     * @param args Object which contains a host of optional parameters
     */
    public async suggestLocationsAtCoordinate(latitude: number, longitude: number, radiusKm: number, args: EventRegistryStatic.SuggestLocationsAtCoordinateArguments = {}) {
        const {
            limitToCities = false,
            lang = "eng",
            count = 20,
            ignoreNonWiki = true,
            returnInfo = new ReturnInfo(),
            ...otherParams
        } = args;
        if (!_.isNumber(latitude)) {
            throw new Error("The 'latitude' should be a number");
        }
        if (!_.isNumber(longitude)) {
            throw new Error("The 'longitude' should be a number");
        }
        let params = {
            action: "getLocationsAtCoordinate",
            lat: latitude,
            lon: longitude,
            radius: radiusKm,
            limitToCities: limitToCities,
            count: count,
            lang: lang,
        };
        params = _.extend({}, params, otherParams, returnInfo.getParams());
        const request = await this.jsonRequest("/api/v1/suggestLocationsFast", params);
        return request.data;
    }

    /**
     * Return a list of news sources that are close to the provided (lat, long) values
     * @param latitude latitude part of the coordinate
     * @param longitude longitude part of the coordinate
     * @param radiusKm radius in kilometers around the coordinates inside which the news sources should be located
     * @param count number of returned suggestions
     */
    public async suggestSourcesAtCoordinate(latitude: number, longitude: number, radiusKm: number, count = 20, ...otherParams) {
        if (!_.isNumber(latitude)) {
            throw new Error("The 'latitude' should be a number");
        }
        if (!_.isNumber(longitude)) {
            throw new Error("The 'longitude' should be a number");
        }
        const params = {
            action: "getSourcesAtCoordinate",
            lat: latitude,
            lon: longitude,
            radius: radiusKm,
            count: count,
            ...otherParams
        };
        const request = await this.jsonRequest("/api/v1/suggestSourcesFast", params);
        return request.data;
    }

    /**
     * Return a list of news sources that are close to the provided (lat, long) values
     * @param conceptUri concept that represents a geographic location for which we would like to obtain a list of sources located at the place
     * @param args Object which contains a host of optional parameters
     */
    public async suggestSourcesAtPlace(conceptUri: string, args: EventRegistryStatic.SuggestSourcesAtPlaceArguments = {}) {
        const { page = 1, count = 20, dataType = "news", ...otherParams } = args;
        const params = {
            action: "getSourcesAtPlace",
            conceptUri: conceptUri,
            page: page,
            count: count,
            dataType: dataType,
            ...otherParams
        };
        const request = await this.jsonRequest("/api/v1/suggestSourcesFast", params);
        return request.data;
    }

    /**
     * Return a list of news sources that match the prefix
     * @param prefix: input text that should be contained in the author name and source url
     * @param page: page of results
     * @param count: number of returned suggestions
     */
    public async suggestAuthors(prefix: string, page = 1, count = 20, ...otherParams) {
        if (page <= 0) {
            throw new Error("Page parameter should be above 0.");
        }
        const params = {
            prefix,
            page,
            count,
            ...otherParams
        };
        const request = await this.jsonRequest("/api/v1/suggestAuthorsFast", params);
        return request.data;
    }

    /**
     * Return a list of concept classes that match the given prefix
     * @param prefix input text that should be contained in the category name
     * @param args Object which contains a host of optional parameters
     */
    public async suggestConceptClasses(prefix: string, args: EventRegistryStatic.SuggestConceptClassesArguments = {}) {
        const {
            lang = "eng",
            conceptLang = "eng",
            source = ["dbpedia", "custom"],
            page = 1,
            count = 20,
            returnInfo = new ReturnInfo(),
            ...otherParams
        } = args;
        if (page < 1) {
            throw new Error("page parameter should be above 0");
        }
        let params = { prefix, lang, conceptLang, source, page, count};
        params = _.extend({}, params, otherParams, returnInfo.getParams());
        const request = await this.jsonRequest("/api/v1/suggestConceptClasses", params);
        return request.data;
    }

    /**
     * return a concept uri that is the best match for the given concept label
     * if there are multiple matches for the given conceptLabel,
     * they are sorted based on their frequency of occurrence in news (most to least frequent)
     * @param conceptLabel partial or full name of the concept for which to return the concept uri
     * @param args Object which contains a host of optional parameters
     */
    public async getConceptUri(conceptLabel: string, args: EventRegistryStatic.GetConceptUriArguments = {}) {
        const { lang = "eng", sources = [ "concepts" ] as EventRegistryStatic.ConceptType[] } = args;
        const matches = await this.suggestConcepts(conceptLabel, { lang, sources });
        return _.get(_.first(matches), "uri", undefined);
    }

    /**
     * Return a location uri that is the best match for the given location label
     * @param locationLabel partial or full location name for which to return the location uri
     * @param args Object which contains a host of optional parameters
     */
    public async getLocationUri(locationLabel: string, args: EventRegistryStatic.GetLocationUriArguments = {}) {
        const { lang = "eng", sources = [ "place", "country" ] as any, countryUri, sortByDistanceTo } = args;
        const matches = await this.suggestLocations(locationLabel, { lang, sources, countryUri, sortByDistanceTo });
        return _.get(_.first(matches), "wikiUri", undefined);
    }

    /**
     * Return a category uri that is the best match for the given label
     * @param categoryLabel partial or full name of the category for which to return category uri
     */
    public async getCategoryUri(categoryLabel: string) {
        const matches = await this.suggestCategories(categoryLabel);
        return _.get(_.first(matches), "uri", undefined);
    }

    /**
     * Return the news source that best matches the source name
     * @param sourceName partial or full name of the source or source uri for which to return source uri
     * @param dataType: return the source uri that provides content of these data types
     */
    public async getNewsSourceUri(sourceName: string, dataType: EventRegistryStatic.DataType[] | EventRegistryStatic.DataType = ["news", "pr", "blog"]) {
        const matches = await this.suggestNewsSources(sourceName, { dataType });
        return _.get(_.first(matches), "uri", undefined);
    }

    /**
     * alternative (shorter) name for the method getNewsSourceUri()
     */
    public async getSourceUri(sourceName: string, dataType: EventRegistryStatic.DataType[] | EventRegistryStatic.DataType = ["news", "pr", "blog"]) {
        return await this.getNewsSourceUri(sourceName, dataType);
    }

    /**
     * Return the URI of the source group that best matches the name
     * @param sourceGroupName partial or full name of the source group
     */
    public async getSourceGroupUri(sourceGroupName: string) {
        const matches = await this.suggestSourceGroups(sourceGroupName);
        return _.get(_.first(matches), "uri", undefined);
    }

    /**
     * Return a uri of the concept class that is the best match for the given label
     * @param classLabel partial or full name of the concept class for which to return class uri
     * @param lang language in which the class label is specified
     */
    public async getConceptClassUri(classLabel: string, lang = "eng") {
        const matches = await this.suggestConceptClasses(classLabel, {lang});
        return _.get(_.first(matches), "uri", undefined);
    }

    /**
     * Return detailed information about a particular concept
     * @param conceptUri uri of the concept
     * @param returnInfo what details about the concept should be included in the returned information
     */
    public async getConceptInfo(conceptUri: string, returnInfo?: ReturnInfo) {
        if (!returnInfo) {
            const conceptInfo = new ConceptInfoFlags({ synonyms: true, image: true, description: true });
            returnInfo = new ReturnInfo({ conceptInfo });
        }
        let params = {
            uri: conceptUri,
            action: "getInfo",
        };
        params = _.extend({}, params, returnInfo.getParams());
        const request = await this.jsonRequest("/api/v1/concept/getInfo", params);
        return request.data;
    }

    /**
     * return author uri that is the best match for the given author name (and potentially source url)
     * if there are multiple matches for the given author name, they are sorted based on the number of articles they have written (from most to least frequent)
     * @param authorName: partial or full name of the author, potentially also containing the source url (e.g. "george brown nytimes")
     */
    public async getAuthorUri(authorName: string) {
        const matches = await this.suggestAuthors(authorName);
        return _.get(_.first(matches), "uri", undefined);
    }

    public static getUriFromUriWgt(uriWgtList: string[]) {
        if (!_.isArray(uriWgtList)) {
            throw new Error("uriWgtList has to be a list of strings that represent article uris");
        }
        return _.map(uriWgtList, (uriWgt) => _.first(_.split(uriWgt, ":")));
    }

    // Additional utility functions

    /**
     * If you have article urls and you want to query them in ER you first have to obtain their uris in the ER.
     * @param articleUrls a single article url or a list of article urls
     */
    public async getArticleUris(articleUrls: string | string[]) {
        if (!_.isArray(articleUrls) && !_.isString(articleUrls)) {
            throw new Error("Expected a single article url or a list of urls");
        }
        const request = await this.jsonRequest("/api/v1/articleMapper", { articleUrl: articleUrls});
        return request.data;
    }

    /**
     * Return information about the latest imported article
     */
    public async getSourceGroups() {
        const request = await this.jsonRequest("/api/v1/sourceGroup/getSourceGroups", { action: "getSourceGroups"});
        return request.data;
    }

    /**
     * Return info about the source group
     */
    public async getSourceGroup(sourceGroupUri: string) {
        const request = await this.jsonRequest("/api/v1/sourceGroup/getSourceGroupInfo", { action: "getSourceGroupInfo", uri: sourceGroupUri});
        return request.data;
    }

    private initRequestLogger() {
        if (this._logRequests && _.isUndefined(this.requestLogger)) {
            this.requestLogger = winston.createLogger({
                level: "info",
                format: winston.format.json(),
                transports: [
                    new winston.transports.File({ filename: "logs/requests.log" }),
                ],
            });
        }
    }
}

/**
 * @class ArticleMapper
 * Create instance of article mapper it will map from article urls to article uris
 * the mappings can be remembered so it will not repeat requests for the same article urls
 */
export class ArticleMapper {
    private er: EventRegistry;
    private articleUrlToUri = {};
    private rememberMappings = true;

    constructor(er: EventRegistry, rememberMapping = true) {
        this.er = er;
        this.rememberMappings = rememberMapping;
    }

    /**
     * Given the article url, return an array with 0, 1 or more article uris.
     * Not all returned article uris are necessarily valid anymore.
     * For news sources of lower importance we remove the duplicated articles and just keep the latest content
     * @param articleUrl string containing the article url
     */
    public async getArticleUri(articleUrl: string) {
        if (_.has(this.articleUrlToUri, articleUrl)) {
            return _.get(this.articleUrlToUri, articleUrl);
        }
        const response = await this.er.getArticleUris(articleUrl);
        const value = _.get(response, articleUrl, undefined);
        if (this.rememberMappings && value) {
            this.articleUrlToUri[articleUrl] = value;
        }
        return value;
    }
}
