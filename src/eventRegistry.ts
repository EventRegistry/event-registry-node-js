import axios, { AxiosResponse } from "axios";
import * as fs from "fs";
import * as _ from "lodash";
import * as moment from "moment";
import * as Qs from "qs";
import * as winston from "winston";
import { Query, sleep } from "./base";
import { QueryArticle, RequestArticleInfo } from "./queryArticle";
import { ConceptInfoFlags, ReturnInfo } from "./returnInfo";
import { ER } from "./types";

/**
 * @class EventRegistry
 * Main class responsible for obtaining results form the Event Registry
 */
export class EventRegistry {
    public logger;
    private config: ER.Config = {
        host: "http://eventregistry.org",
        hostAnalytics: "http://analytics.eventregistry.org",
        logging: false,
        minDelayBetweenRequests: 1,
        repeatFailedRequestCount: 2,
        verboseOutput: false,
    };
    private lastQueryTime = 0;

    constructor(config: ER.Config = {}) {
        if (fs && fs.existsSync(this.config.settingsFName || "settings.json")) {
            const localConfig = JSON.parse(fs.readFileSync(this.config.settingsFName || "settings.json", "utf8"));
            _.extend(this.config, localConfig);
            if (!_.isNil(config.apiKey)) {
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

        if (_.isNil(this.config.apiKey)) {
            console.info("No API key was provided. You will be allowed to perform only a very limited number of requests per day.");
        }
        this.config.minDelayBetweenRequests *= 1000;

        axios.interceptors.response.use(undefined, (err) => {
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

            return new Promise((resolve) => {
                setTimeout(() => resolve(), err.config.retryDelay || 1);
            }).then(() => axios(err.config));
        });
    }
    /**
     * Main method for executing the search queries.
     * @param query instance of Query class
     */
    public async execQuery(query) {
        const params = query.getQueryParams();
        const request = await this.jsonRequest(query.path, params);
        if (!_.has(request, "data") && this.config.verboseOutput) {
            this.logger.error("Request did not return with the 'data' property.");
        }
        return _.get(request, "data", {});
    }

    public async jsonRequestAnalytics(path, parameters?): Promise<AxiosResponse> {
        let request;
        try {
            request = await axios.request({
                url: path,
                baseURL: this.config.hostAnalytics,
                params: parameters,
                paramsSerializer: (params) => {
                    _.set(params, "apiKey", this.config.apiKey);
                    return Qs.stringify(params, { arrayFormat: "repeat" });
                },
                timeout: 600000,
                responseType: "json",
                maxRedirects: 5,
            });
        } catch (error) {
            // try to print out the error that should be passed by in case the server is down or responds with errors
            if (this.config.logging) {
                this.logger.error(_.get(error, "errno", error));
            }
            if (this.config.verboseOutput) {
                console.error(error);
            }
        }
        return request;
    }

    /**
     * Make a request for json data
     * @param path URL on Event Registry (e.g. "/json/article")
     * @param parameters Optional parameters to be included in the request
     */
    public async jsonRequest(path, parameters?) {
        let request;
        const current = moment.utc().milliseconds();
        if (this.lastQueryTime && current - this.lastQueryTime < this.config.minDelayBetweenRequests) {
            await sleep(this.config.minDelayBetweenRequests - (current - this.lastQueryTime) );
        }
        this.lastQueryTime = current;
        try {
            request = await axios.request({
                url: path,
                baseURL: this.config.host,
                params: parameters,
                paramsSerializer: (params) => {
                    _.set(params, "apiKey", this.config.apiKey);
                    return Qs.stringify(params, { arrayFormat: "repeat" });
                },
                timeout: 600000,
                responseType: "json",
                maxRedirects: 5,
                retry: this.config.repeatFailedRequestCount,
            } as any);
        } catch (error) {
            // try to print out the error that should be passed by in case the server is down or responds with errors
            if (this.config.logging) {
                this.logger.error(_.get(error, "errno", error));
            }
            if (this.config.verboseOutput) {
                console.error(error);
            }
        }
        return request;
    }
    /**
     * Return a list of concepts that contain the given prefix.
     * Returned matching concepts are sorted based on their frequency of occurrence in news (from most to least frequent)
     * @param prefix input text that should be contained in the concept
     * @param args Object which contains a host of optional parameters
     */
    public async suggestConcepts(prefix: string, args: ER.SuggestConceptsArguments = {}) {
        const { sources = [ "concepts" ] as ER.ConceptType[], lang = "eng", conceptLang = "eng", page = 1, count = 20, returnInfo = new ReturnInfo() } = args;
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
        params = _.extend({}, params, returnInfo.getParams());
        const request = await this.jsonRequest("/json/suggestConcepts", params);
        return request.data;
    }

    /**
     * Return a list of dmoz categories that contain the prefix
     * @param prefix input text that should be contained in the category name
     * @param args Object which contains a host of optional parameters
     */
    public async suggestCategories(prefix, args: ER.SuggestCategoriesArguments = {}) {
        const {page = 1, count = 20, returnInfo = new ReturnInfo()} = args;
        if (page <= 0) {
            throw new RangeError("page parameter should be above 0");
        }
        let params = {prefix, page, count};
        params = _.extend({}, params, returnInfo.getParams());
        const request = await this.jsonRequest("/json/suggestCategories", params);
        return request.data;
    }

    /**
     * Return a list of news sources that match the prefix
     * @param prefix input text that should be contained in the source name or uri
     * @param args Object which contains a host of optional parameters
     */
    public async suggestNewsSources(prefix, args: ER.SuggestNewsSourcesArguments = {}) {
        const {page = 1, count = 20, dataType = ["news", "pr"]} = args;
        if (page <= 0) {
            throw new RangeError("page parameter should be above 0");
        }
        const request = await this.jsonRequest("/json/suggestSources", {prefix, page, dataType, count});
        return request.data;
    }

    /**
     * Return a list of news source groups that match the prefix
     * @param prefix input text that should be contained in the source group name or uri
     * @param args Object which contains a host of optional parameters
     */
    public async suggestSourceGroups(prefix, args: ER.SuggestSourceGroupsArguments = {}) {
        const {page = 1, count = 20} = args;
        if (page <= 0) {
            throw new RangeError("page parameter should be above 0");
        }
        const request = await this.jsonRequest("/json/suggestSourceGroups", {prefix, page, count});
        return request.data;
    }

    /**
     * Return a list of geo locations (cities or countries) that contain the prefix
     * @param prefix input text that should be contained in the location name
     * @param args Object which contains a host of optional parameters
     */
    public async suggestLocations(prefix, args: ER.SuggestLocationsArguments = {}) {
        const {sources = ["place", "country"], lang = "eng", count = 20, countryUri = "", sortByDistanceTo = undefined, returnInfo = new ReturnInfo()} = args;
        let params = {
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
        const request = await this.jsonRequest("/json/suggestLocations", params);
        return request.data;
    }

    /**
     * Return a list of geo locations (cities or places) that are close to the provided (lat, long) values
     * @param latitude latitude part of the coordinate
     * @param longitude longitude part of the coordinate
     * @param radiusKm radius in kilometers around the coordinates inside which the locations should be returned
     * @param args Object which contains a host of optional parameters
     */
    public async suggestLocationsAtCoordinate(latitude: number, longitude: number, radiusKm: number, args: ER.SuggestLocationsAtCoordinateArguments = {}) {
        const { limitToCities = false, lang = "eng", count = 20, ignoreNonWiki = true, returnInfo = new ReturnInfo()} = args;
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
        params = _.extend({}, params, returnInfo.getParams());
        const request = await this.jsonRequest("/json/suggestLocations", params);
        return request.data;
    }

    /**
     * Return a list of news sources that are close to the provided (lat, long) values
     * @param latitude latitude part of the coordinate
     * @param longitude longitude part of the coordinate
     * @param radiusKm radius in kilometers around the coordinates inside which the news sources should be located
     * @param count number of returned suggestions
     */
    public async suggestSourcesAtCoordinate(latitude: number, longitude: number, radiusKm: number, count: number = 20) {
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
        };
        const request = await this.jsonRequest("/json/suggestSources", params);
        return request.data;
    }

    /**
     * Return a list of news sources that are close to the provided (lat, long) values
     * @param conceptUri concept that represents a geographic location for which we would like to obtain a list of sources located at the place
     * @param args Object which contains a host of optional parameters
     */
    public async suggestSourcesAtPlace(conceptUri: string, args: ER.SuggestSourcesAtPlaceArguments = {}) {
        const { page = 1, count = 20 } = args;
        const params = {
            action: "getSourcesAtPlace",
            conceptUri: conceptUri,
            page: page,
            count: count,
        };
        const request = await this.jsonRequest("/json/suggestSources", params);
        return request.data;
    }

    /**
     * Return a list of concept classes that match the given prefix
     * @param prefix input text that should be contained in the category name
     * @param args Object which contains a host of optional parameters
     */
    public async suggestConceptClasses(prefix, args: ER.SuggestConceptClassesArguments = {}) {
        const { lang = "eng", conceptLang = "eng", source = ["dbpedia", "custom"], page = 1, count = 20, returnInfo = new ReturnInfo() } = args;
        if (page < 1) {
            throw new Error("page parameter should be above 0");
        }
        let params = { prefix, lang, conceptLang, source, page, count};
        params = _.extend({}, params, returnInfo.getParams());
        const request = await this.jsonRequest("/json/suggestConceptClasses", params);
        return request.data;
    }

    /**
     * Return a list of custom concepts that contain the given prefix.
     * Custom concepts are the things (indicators, stock prices, ...)
     * for which we import daily trending values that can be obtained using GetCounts class
     * @param prefix input text that should be contained in the concept name
     * @param args Object which contains a host of optional parameters
     */
    public async suggestCustomConcepts(prefix, args: ER.SuggestCustomConceptsArguments = {}) {
        const { lang = "eng", conceptLang = "eng", page = 1, count = 20, returnInfo = new ReturnInfo() } = args;
        if (page < 1) {
            throw new Error("page parameter should be above 0");
        }
        let params = { prefix, lang, conceptLang, page, count};
        params = _.extend({}, params, returnInfo.getParams());
        const request = await this.jsonRequest("/json/suggestCustomConcepts", params);
        return request.data;
    }

    /**
     * return a concept uri that is the best match for the given concept label
     * if there are multiple matches for the given conceptLabel,
     * they are sorted based on their frequency of occurrence in news (most to least frequent)
     * @param conceptLabel partial or full name of the concept for which to return the concept uri
     * @param args Object which contains a host of optional parameters
     */
    public async getConceptUri(conceptLabel, args: ER.GetConceptUriArguments = {}) {
        const { lang = "eng", sources = [ "concepts" ] as ER.ConceptType[] } = args;
        const matches = await this.suggestConcepts(conceptLabel, { lang, sources });
        return _.get(_.first(matches), "uri", undefined);
    }

    /**
     * Return a location uri that is the best match for the given location label
     * @param locationLabel partial or full location name for which to return the location uri
     * @param args Object which contains a host of optional parameters
     */
    public async getLocationUri(locationLabel, args: ER.GetLocationUriArguments = {}) {
        const { lang = "eng", sources = [ "place", "country" ] as any, countryUri = undefined, sortByDistanceTo = undefined } = args;
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
    public async getNewsSourceUri(sourceName: string, dataType: ER.DataType[] | ER.DataType = ["news", "pr"]) {
        const matches = await this.suggestNewsSources(sourceName, { dataType });
        return _.get(_.first(matches), "uri", undefined);
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
    public async getConceptClassUri(classLabel: string, lang: string = "eng") {
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
        const request = await this.jsonRequest("/json/concept", params);
        return request.data;
    }

    /**
     * Return a custom concept uri that is the best match for the given custom concept label
     * note that for the custom concepts we don't have a sensible way of sorting the candidates that match the label
     * if multiple candidates match the label we cannot guarantee which one will be returned
     * @param label label of the custom concept
     * @param lang language in which the label is specified
     */
    public async getCustomConceptUri(label: string, lang: string = "eng") {
        const matches = await this.suggestCustomConcepts(label, {lang});
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
        const request = await this.jsonRequest("/json/articleMapper", { articleUrl: articleUrls});
        return request.data;
    }

    /**
     * Return information about the latest imported article
     */
    public async getSourceGroups() {
        const request = await this.jsonRequest("/json/sourceGroup", { action: "getSourceGroups"});
        return request.data;
    }

    /**
     * Return info about the source group
     */
    public async getSourceGroup(sourceGroupUri) {
        const request = await this.jsonRequest("/json/sourceGroup", { action: "getSourceGroupInfo", uri: sourceGroupUri});
        return request.data;
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

    constructor(er, rememberMapping = true) {
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
