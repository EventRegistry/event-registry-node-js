import { ReturnInfo } from "./returnInfo";
import { ER } from "./types";
/**
 * @class EventRegistry
 * Main class responsible for obtaining results form the Event Registry
 */
export declare class EventRegistry {
    logger: any;
    private config;
    private lastQueryTime;
    constructor(config?: ER.Config);
    /**
     * Main method for executing the search queries.
     * @param query instance of Query class
     */
    execQuery(query: any): Promise<any>;
    /**
     * Make a request for json data
     * @param path URL on Event Registry (e.g. "/json/article")
     * @param parameters Optional parameters to be included in the request
     */
    jsonRequest(path: any, parameters?: any): Promise<any>;
    /**
     * Return a list of concepts that contain the given prefix.
     * Returned matching concepts are sorted based on their frequency of occurrence in news (from most to least frequent)
     * @param prefix input text that should be contained in the concept
     * @param args Object which contains a host of optional parameters
     */
    suggestConcepts(prefix: string, args?: ER.SuggestConceptsArguments): Promise<any>;
    /**
     * Return a list of dmoz categories that contain the prefix
     * @param prefix input text that should be contained in the category name
     * @param args Object which contains a host of optional parameters
     */
    suggestCategories(prefix: any, args?: ER.SuggestCategoriesArguments): Promise<any>;
    /**
     * Return a list of news sources that match the prefix
     * @param prefix input text that should be contained in the source name or uri
     * @param args Object which contains a host of optional parameters
     */
    suggestNewsSources(prefix: any, args?: ER.SuggestNewsSourcesArguments): Promise<any>;
    /**
     * Return a list of news source groups that match the prefix
     * @param prefix input text that should be contained in the source group name or uri
     * @param args Object which contains a host of optional parameters
     */
    suggestSourceGroups(prefix: any, args?: ER.SuggestSourceGroupsArguments): Promise<any>;
    /**
     * Return a list of geo locations (cities or countries) that contain the prefix
     * @param prefix input text that should be contained in the location name
     * @param args Object which contains a host of optional parameters
     */
    suggestLocations(prefix: any, args?: ER.SuggestLocationsArguments): Promise<any>;
    /**
     * Return a list of geo locations (cities or places) that are close to the provided (lat, long) values
     * @param latitude latitude part of the coordinate
     * @param longitude longitude part of the coordinate
     * @param radiusKm radius in kilometers around the coordinates inside which the locations should be returned
     * @param args Object which contains a host of optional parameters
     */
    suggestLocationsAtCoordinate(latitude: number, longitude: number, radiusKm: number, args?: ER.SuggestLocationsAtCoordinateArguments): Promise<any>;
    /**
     * Return a list of news sources that are close to the provided (lat, long) values
     * @param latitude latitude part of the coordinate
     * @param longitude longitude part of the coordinate
     * @param radiusKm radius in kilometers around the coordinates inside which the news sources should be located
     * @param count number of returned suggestions
     */
    suggestSourcesAtCoordinate(latitude: number, longitude: number, radiusKm: number, count?: number): Promise<any>;
    /**
     * Return a list of news sources that are close to the provided (lat, long) values
     * @param conceptUri concept that represents a geographic location for which we would like to obtain a list of sources located at the place
     * @param args Object which contains a host of optional parameters
     */
    suggestSourcesAtPlace(conceptUri: string, args?: ER.SuggestSourcesAtPlaceArguments): Promise<any>;
    /**
     * Return a list of concept classes that match the given prefix
     * @param prefix input text that should be contained in the category name
     * @param args Object which contains a host of optional parameters
     */
    suggestConceptClasses(prefix: any, args?: ER.SuggestConceptClassesArguments): Promise<any>;
    /**
     * Return a list of custom concepts that contain the given prefix.
     * Custom concepts are the things (indicators, stock prices, ...)
     * for which we import daily trending values that can be obtained using GetCounts class
     * @param prefix input text that should be contained in the concept name
     * @param args Object which contains a host of optional parameters
     */
    suggestCustomConcepts(prefix: any, args?: ER.SuggestCustomConceptsArguments): Promise<any>;
    /**
     * return a concept uri that is the best match for the given concept label
     * if there are multiple matches for the given conceptLabel,
     * they are sorted based on their frequency of occurrence in news (most to least frequent)
     * @param conceptLabel partial or full name of the concept for which to return the concept uri
     * @param args Object which contains a host of optional parameters
     */
    getConceptUri(conceptLabel: any, args?: ER.GetConceptUriArguments): Promise<any>;
    /**
     * Return a location uri that is the best match for the given location label
     * @param locationLabel partial or full location name for which to return the location uri
     * @param args Object which contains a host of optional parameters
     */
    getLocationUri(locationLabel: any, args?: ER.GetLocationUriArguments): Promise<any>;
    /**
     * Return a category uri that is the best match for the given label
     * @param categoryLabel partial or full name of the category for which to return category uri
     */
    getCategoryUri(categoryLabel: string): Promise<any>;
    /**
     * Return the news source that best matches the source name
     * @param sourceName partial or full name of the source or source uri for which to return source uri
     */
    getNewsSourceUri(sourceName: string): Promise<any>;
    /**
     * Return the URI of the source group that best matches the name
     * @param sourceGroupName partial or full name of the source group
     */
    getSourceGroupUri(sourceGroupName: string): Promise<any>;
    /**
     * Return a uri of the concept class that is the best match for the given label
     * @param classLabel partial or full name of the concept class for which to return class uri
     * @param lang language in which the class label is specified
     */
    getConceptClassUri(classLabel: string, lang?: string): Promise<any>;
    /**
     * Return detailed information about a particular concept
     * @param conceptUri uri of the concept
     * @param returnInfo what details about the concept should be included in the returned information
     */
    getConceptInfo(conceptUri: string, returnInfo?: ReturnInfo): Promise<any>;
    /**
     * Return a custom concept uri that is the best match for the given custom concept label
     * note that for the custom concepts we don't have a sensible way of sorting the candidates that match the label
     * if multiple candidates match the label we cannot guarantee which one will be returned
     * @param label label of the custom concept
     * @param lang language in which the label is specified
     */
    getCustomConceptUri(label: string, lang?: string): Promise<any>;
    /**
     * Get some stats about recently imported articles and events
     */
    getRecentStats(): Promise<any>;
    /**
     * get total statistics about all imported articles, concepts, events as well as daily counts for these
     */
    getStats(args?: ER.GetStatsArguments): Promise<any>;
    /**
     * If you have article urls and you want to query them in ER you first have to obtain their uris in the ER.
     * @param articleUrls a single article url or a list of article urls
     */
    getArticleUris(articleUrls: string | string[]): Promise<any>;
    /**
     * Return information about the latest imported article
     */
    getLatestArticle(returnInfo?: ReturnInfo): Promise<any>;
    /**
     * Return information about the latest imported article
     */
    getSourceGroups(): Promise<any>;
    /**
     * Return info about the source group
     */
    getSourceGroup(sourceGroupUri: any): Promise<any>;
}
/**
 * @class ArticleMapper
 * Create instance of article mapper it will map from article urls to article uris
 * the mappings can be remembered so it will not repeat requests for the same article urls
 */
export declare class ArticleMapper {
    private er;
    private articleUrlToUri;
    private rememberMappings;
    constructor(er: any, rememberMapping?: boolean);
    /**
     * Given the article url, return an array with 0, 1 or more article uris.
     * Not all returned article uris are necessarily valid anymore.
     * For news sources of lower importance we remove the duplicated articles and just keep the latest content
     * @param articleUrl string containing the article url
     */
    getArticleUri(articleUrl: string): Promise<any>;
}
