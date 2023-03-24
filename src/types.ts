import { QueryItems } from "./base";
import { BaseQuery, CombinedQuery} from "./query";
import { QueryArticles, RequestArticles } from "./queryArticles";
import { RequestEvents } from "./queryEvents";
import { RequestMentions } from "./queryMentions";
import { ReturnInfo } from "./returnInfo";

/**
 * Type definitions for different classes and functions from the Event Registry Node JS SDK.
 */
export module EventRegistryStatic {

    export interface UsageInfo {
        availableTokens: number;
        usedTokens: number;
    }

    export interface ServiceStatus {
        [name: string]: any;
    }

    export interface Config {
        /**
         * API key that should be used to make the requests to the Event Registry.
         * API key is assigned to each user account and can be obtained on this page:
         * http://eventregistry.org/me?tab=settings
         */
        apiKey?: string;
        /**
         *  Host to use to access the Event Registry backend
         */
        host?: string;
        /**
         * host address to use to perform the analytics api calls
         */
        hostAnalytics?: string;
        /**
         * log all requests
         */
        logging?: boolean;
        /**
         * The minimum number of seconds between individual api calls
         */
        minDelayBetweenRequests?: number;
        /**
         * if a request fails (for example, because ER is down),
         * what is the max number of times the request should be repeated
         */
        repeatFailedRequestCount?: number;
        /**
         * if true, additional info about errors etc. will be printed to console
         */
        verboseOutput?: boolean;
        /**
         * print which urls are used as the hosts
         */
        printHostInfo?: boolean;
        settingsFName?: string;
        allowUseOfArchive?: boolean;
    }

    export type BaseConceptType = "person" | "loc" | "org" | "wiki";

    export type ConceptType = "person" | "loc" | "org" | "wiki" | "entities" | "concepts"  | "conceptClass" | "conceptFolder";

    export type SourceType = "place" | "country";

    export type ConceptClassType = "dbpedia" | "custom";

    export type DataType = "news" | "pr" | "blog";

    /**
     * Options:
     *  * id (internal id),
     *  * date (publishing date),
     *  * cosSim (closeness to the event centroid),
     *  * rel (relevance to the query),
     *  * sourceImportance (manually curated score of source importance - high value, high importance),
     *  * sourceImportanceRank (reverse of sourceImportance),
     *  * sourceAlexaGlobalRank (global rank of the news source),
     *  * sourceAlexaCountryRank (country rank of the news source),
     *  * socialScore (total shares on social media),
     *  * facebookShares (shares on Facebook only)
     */
    export type SortBy = "id" | "date" | "cosSim" | "rel" | "sourceImportance" | "sourceImportanceRank" | "sourceAlexaGlobalRank" | "sourceAlexaCountryRank" | "socialScore" | "facebookShares";

    export interface SuggestConceptsArguments {
        /**
         * What types of concepts should be returned
         */
        sources?: EventRegistryStatic.ConceptType[];
        /**
         * Language in which the prefix is specified
         */
        lang?: string | string[];
        /**
         * Languages in which the label(s) for the concepts are to be returned
         */
        conceptLang?: string | string[];
        /**
         * Page of the results (1, 2, ...)
         */
        page?: number;
        /**
         * Number of returned suggestions per page
         */
        count?: number;
        /**
         * What details about concepts should be included in the returned information
         */
        returnInfo?: ReturnInfo;
    }

    export interface SuggestCategoriesArguments {
        /**
         * page of the results (1, 2, ...)
         */
        page?: number;
        /**
         * number of returned suggestions
         */
        count?: number;
        /**
         * what details about categories should be included in the returned information
         */
        returnInfo?: ReturnInfo;
    }

    export interface SuggestNewsSourcesArguments {
        /**
         * page of the results (1, 2, ...)
         */
        page?: number;
        /**
         * number of returned suggestions
         */
        count?: number;
        /**
         * Suggest sources that provide content in these data types
         */
        dataType?: EventRegistryStatic.DataType[] | EventRegistryStatic.DataType;
    }

    export interface SuggestSourceGroupsArguments {
        /**
         * page of the results (1, 2, ...)
         */
        page?: number;
        /**
         * number of returned suggestions
         */
        count?: number;
    }

    export interface SuggestLocationsArguments {
        /**
         * What types of locations are we interested in.
         */
        sources?: EventRegistryStatic.SourceType[];
        /**
         * Language in which the prefix is specified
         */
        lang?: string;
        /**
         * Number of returned suggestions
         */
        count?: number;
        /**
         * If provided, then return only those locations that are inside the specified country
         */
        countryUri?: string;
        /**
         * If provided, then return the locations sorted by the distance to the (lat, long) provided in the tuple
         */
        sortByDistanceTo?: number[];
        /**
         * What details about locations should be included in the returned information
         */
        returnInfo?: ReturnInfo;
    }

    export interface SuggestLocationsAtCoordinateArguments {
        /**
         * Limit the set of results only to cities (true) or also to general places (false)
         */
        limitToCities?: boolean;
        /**
         * Language in which the location label should be returned
         */
        lang?: string;
        /**
         * Number of returned suggestions
         */
        count?: number;
        /**
         * Ignore locations that don't have a wiki page and can not be used for concept search
         */
        ignoreNonWiki?: boolean;
        /**
         * What details about locations should be included in the returned information
         */
        returnInfo?: ReturnInfo;
    }

    export interface SuggestSourcesAtPlaceArguments {
        /**
         * page of the results (1, 2, ...)
         */
        page?: number;
        /**
         * number of returned sources
         */
        count?: number;
        /**
         * type of the news source ("news", "pr", "blog" or a list of any of those)
         */
        dataType?: DataType;
    }

    export interface SuggestConceptClassesArguments {
        /**
         * language in which the prefix is specified
         */
        lang?: string;
        /**
         * languages in which the label(s) for the concepts are to be returned
         */
        conceptLang?: string;
        /**
         * what types of concepts classes should be returned.
         */
        source?: EventRegistryStatic.ConceptClassType[];
        /**
         * page of the results (1, 2, ...)
         */
        page?: number;
        /**
         * number of returned suggestions
         */
        count?: number;
        /**
         * what details about categories should be included in the returned information
         */
        returnInfo?: ReturnInfo;
    }

    export interface SuggestCustomConceptsArguments {
        /**
         * language in which the prefix is specified
         */
        lang?: string;
        /**
         * languages in which the label(s) for the concepts are to be returned
         */
        conceptLang?: string;
        /**
         * page of the results (1, 2, ...)
         */
        page?: number;
        /**
         * number of returned suggestions
         */
        count?: number;
        /**
         * what details about categories should be included in the returned information
         */
        returnInfo?: ReturnInfo;
    }

    export interface GetConceptUriArguments {
        /**
         * language in which the prefix is specified
         */
        lang?: string;
        /**
         * what types of concepts should be returned.
         */
        sources?: EventRegistryStatic.ConceptType[];
    }

    export interface GetLocationUriArguments {
        /**
         * language in which the prefix is specified
         */
        lang?: string;
        /**
         * what types of locations are we interested in.
         */
        sources?: EventRegistryStatic.SourceType | EventRegistryStatic.SourceType[];
        /**
         * if set, then filter the possible locations to the locations from that country
         */
        countryUri?: string;
        /**
         * sort candidates by distance to the given (lat, long) pair
         */
        sortByDistanceTo?: number[];
    }

    export interface GetStatsArguments {
        addDailyArticles?: boolean;
        addDailyAnnArticles?: boolean;
        addDailyDuplArticles?: boolean;
        addDailyEvents?: boolean;
    }

    export interface TopicPage {
        autoAddArticles: boolean;
        articleHasDuplicate: "skipHasDuplicates" | "keepOnlyHasDuplicates" | "keepAll";
        articleHasEvent: "skipArticlesWithoutEvent" | "keepOnlyArticlesWithoutEvent" | "keepAll";
        articleIsDuplicate: "skipDuplicates" | "keepOnlyDuplicates" | "keepAll";
        maxDaysBack: number;
        articleTreshWgt: number;
        eventTreshWgt: number;
        concepts: Array<{uri: string, wgt: number, required?: boolean, excluded?: boolean}>;
        keywords: Array<{keyword: string, wgt: number, required?: boolean, excluded?: boolean}>;
        categories: Array<{uri: string, wgt: number, required?: boolean, excluded?: boolean}>;
        sources: Array<{uri: string, wgt: number, excluded?: boolean}>;
        sourceGroups: Array<{uri: string, wgt: number, excluded?: boolean}>;
        sourceLocations: Array<{uri: string, wgt: number, excluded?: boolean}>;
        locations: Array<{uri: string, wgt: number}>;
        langs: string[];
        startSourceRankPercentile?: number;
        endSourceRankPercentile?: number;
        restrictToSetConcepts: boolean;
        restrictToSetCategories: boolean;
        restrictToSetSources: boolean;
        restrictToSetLocations: boolean;
        dataType: EventRegistryStatic.DataType | EventRegistryStatic.DataType[];
    }

    export interface TopicPageAddConceptArguments {
        label?: string;
        conceptType?: string;
        required?: boolean;
        excluded?: boolean;
    }

    export interface TopicPageAddKeywordArguments {
        required?: boolean;
        excluded?: boolean;
    }

    export interface TopicPageAddCategoryArguments {
        required?: boolean;
        excluded?: boolean;
    }

    export interface TopicPageAddSourceArguments {
        excluded?: boolean;
    }

    export interface TopicPageAddSourceLocationArguments {
        excluded?: boolean;
    }

    export interface TopicPageAddSourceGroupArguments {
        excluded?: boolean;
    }

    export interface TopicPageArticles {
        /**
         * Which page of the results to return (default: 1).
         */
        page?: number;
        /**
         * Number of articles to return (default: 100)
         */
        count?: number;
        /**
         * How are articles sorted
         */
        sortBy?: SortBy;
        /**
         * Should the results be sorted in ascending order (true) or descending (false)
         */
        sortByAsc?: boolean;
        dataType?: EventRegistryStatic.DataType | EventRegistryStatic.DataType[];
        /**
         * What details should be included in the returned information
         */
        returnInfo?: ReturnInfo;
        [name: string]: (string | number | boolean | ReturnInfo) | (string | number | boolean)[];
    }

    export interface TopicPageEvents {
        /**
         * Which page of the results to return (default: 1).
         */
        page?: number;
        /**
         * Number of events to return (default: 50)
         */
        count?: number;
        /**
         * How are events sorted
         */
        sortBy?: SortBy;
        /**
         * Should the results be sorted in ascending order (true) or descending (false)
         */
        sortByAsc?: boolean;
        /**
         * What details should be included in the returned information
         */
        returnInfo?: ReturnInfo;
        [name: string]: (string | number | boolean | ReturnInfo) | (string | number | boolean)[];
    }

    export namespace Correlations {
        export interface TopConceptArguments {
            /**
             * An instance of QueryArticles that can be used to limit the space of concept candidates
             */
            candidateConceptsQuery?: QueryArticles;
            /**
             * If candidateConceptsQuery is provided, then this number of concepts for each valid type will be return as candidates
             */
            candidatesPerType?: number;
            /**
             *  A string or an array containing the concept types that are valid candidates on which to compute top correlations
             *     valid values are "person", "org", "loc" and/or "wiki"
             */
            conceptType?: string | string[];
            /**
             * the number of returned concepts for which the exact value of the correlation is computed
             */
            exactCount?: number;
            /**
             * the number of returned concepts for which only an approximate value of the correlation is computed
             */
            approxCount?: number;
            /**
             * specifies the details about the concepts that should be returned in the output result
             */
            returnInfo?: ReturnInfo;
        }

        export interface TopCategoryArguments {
            /**
             * the number of returned categories for which the exact value of the correlation is computed
             */
            exactCount?: number;
            /**
             * the number of returned categories for which only an approximate value of the correlation is computed
             */
            approxCount?: number;
            /**
             * specifies the details about the categories that should be returned in the output result
             */
            returnInfo?: ReturnInfo;
        }
    }

    export namespace Counts {
        export interface Arguments {
            /**
             * input source information from which to compute top trends.
             */
            source?: "news" | "social" | "custom" | "geo" | "sentiment";
            /**
             * What do the uris represent?
             */
            type?: "concept" | "category";
            /**
             * Starting date from which to provide counts onwards (format: YYYY-MM-DD).
             */
            dateStart?: string | Date;
            /**
             * Ending date until which to provide counts (format: YYYY-MM-DD).
             */
            dateEnd?: string | Date;
            /**
             * What details should be included in the returned information.
             */
            returnInfo?: ReturnInfo;
        }
    }

    export namespace DailyShares {
        export interface Arguments {
            /**
             * Specify the date for which to return top shared articles. If undefined then today is used.
             */
            date?: string;
            /**
             * Number of top shared articles to return
             */
            count?: number;
            /**
             * Specifies the details that should be returned in the output result
             */
            returnInfo?: ReturnInfo;
        }
    }

    export namespace Analytics {
        export interface TrainTopicOnTweetsArguments {
            /**
             * Do you want to analyze the content of the tweets and extract the concepts mentioned in them?
             * If false, only content shared in the articles in the user's tweets will be analyzed.
             */
            useTweetText?: boolean;
            /**
             * Normalize identified concepts by their IDF in the news (punish very common concepts)
             */
            useIdfNormalization?: boolean;
            /**
             * Way to normalize the concept weights ("none", "linear")
             */
            normalization?: "none" | "linear";
            /**
             * The number of concepts to save in the final topic.
             */
            maxConcepts?: number;
            /**
             * The number of categories to save in the final topic.
             */
            maxCategories?: number;
            /**
             * The maximum number of tweets to collect for the user to analyze.
             */
            maxTweets?: number;
            /**
             * maximum number of article links in the tweets to analyze (default 500, max 2000)
             */
            maxUsedLinks?: number;
            /**
             * what types of concepts you would like to ignore in the profile. options: person, org, loc, wiki or an array with those
             */
            ignoreConceptTypes?: BaseConceptType | BaseConceptType[];
            /**
             * When finished, should we send a notification email to this address?
             */
            notifyEmailAddress?: string;
        }
        export interface TrainTopicGetTrainedTopicArguments {
            maxConcepts?: number;
            maxCategories?: number;
            idfNormalization?: boolean;
        }
    }

    export namespace Info {
        export interface GetSourceInfoArguments {
            /**
             * single source uri or a list of source uris for which to return information
             */
            uriOrUriList?: string | string[];
            /**
             * what details about the source should be included in the returned information
             */
            returnInfo?: ReturnInfo;
        }

        export interface GetConceptInfoArguments {
            /**
             * single concept uri or a list of concept uris for which to return information
             */
            uriOrUriList?: string | string[];
            /**
             * what details about the source should be included in the returned information
             */
            returnInfo?: ReturnInfo;
        }

        export interface  GetCategoryInfoArguments {
            /**
             * single category uri or a list of category uris for which to return information
             */
            uriOrUriList?: string | string[];
            /**
             * what details about the source should be included in the returned information
             */
            returnInfo?: ReturnInfo;
        }
    }

    export namespace Query {
        export interface BaseQueryArguments {
            /**
             * Keyword(s) to query. Either undefined, string or QueryItems.
             */
            keyword?: string | QueryItems;
            /**
             * Concept(s) to query. Either undefined, string or QueryItems.
             */
            conceptUri?: string | QueryItems;
            /**
             * Source(s) to query. Either undefined, string or QueryItems.
             */
            sourceUri?: string | QueryItems;
            /**
             * Location(s) to query. Either undefined, string or QueryItems.
             */
            locationUri?: string | QueryItems;
            /**
             * CategoryUri categories to query. Either undefined, string or QueryItems.
             */
            categoryUri?: string | QueryItems;
            /**
             * Language(s) to query. Either undefined, string or QueryItems.
             */
            lang?: string | QueryItems;
            /**
             * Starting date. Either undefined, string or date.
             */
            dateStart?: string | Date;
            /**
             * Ending date. Either undefined, string or date.
             */
            dateEnd?: string | Date;
            /**
             * Search by mentioned dates - Either undefined, string or date or a list of these types.
             */
            dateMention?: string | string[];
            /**
             * Find content generated by news sources at the specified geographic location - can be a city URI or a country URI. Multiple items can be provided using a list.
             */
            sourceLocationUri?: string | string[];
            /**
             * A single or multiple source group URIs. A source group is a group of news sources, commonly defined based on common topic or importance.
             */
            sourceGroupUri?: string | string[];
            /**
             * Author(s) to query. Either undefined, string or QueryItems.
             */
            authorUri?: string | string[];
            /**
             * Should we include the subcategories of the searched categories?
             */
            categoryIncludeSub?: boolean;
            /**
             * Where should we look when searching using the keywords provided by "keyword" parameter. "body" (default), "title", or "body,title".
             */
            keywordLoc?: "body" | "title" | "body,title";
            /**
             * A tuple containing the minimum and maximum number of articles that should be in the resulting events. Parameter relevant only if querying events.
             */
            minMaxArticlesInEvent?: [number, number];
            /**
             * A instance of BaseQuery, CombinedQuery or undefined. Used to filter out results matching the other criteria specified in this query.
             */
            exclude?: BaseQuery | CombinedQuery;
        }

        export interface ComplexArticleQueryArguments {
            /**
             * Some articles can be duplicates of other articles. What should be done with them.
             * Possible values are:
             *  - "skipDuplicates" (skip the resulting articles that are duplicates of other articles)
             *  - "keepOnlyDuplicates" (return only the duplicate articles)
             *  - "keepAll" (no filtering, default)
             */
            isDuplicateFilter?: "skipDuplicates" | "keepOnlyDuplicates" | "keepAll";
            /**
             * some articles are later copied by others. What should be done with such articles.
             * Possible values are:
             *  - "skipHasDuplicates" (skip the resulting articles that have been later copied by others)
             *  - "keepOnlyHasDuplicates" (return only the articles that have been later copied by others)
             *  - "keepAll" (no filtering, default)
             */
            hasDuplicateFilter?: "skipDuplicates" | "keepOnlyDuplicates" | "keepAll";
            /**
             * Some articles describe a known event and some don't. This filter allows you to filter the resulting articles based on this criteria.
             * Possible values are:
             *  - "skipArticlesWithoutEvent" (skip articles that are not describing any known event in ER)
             *  - "keepOnlyArticlesWithoutEvent" (return only the articles that are not describing any known event in ER)
             *  - "keepAll" (no filtering, default)
             */
            eventFilter?: "skipArticlesWithoutEvent" | "keepOnlyArticlesWithoutEvent" | "keepAll";
            /**
             * Data type to search for. Possible values are "news" (news content), "pr" (PR content) or "blogs".
             * If you want to use multiple data types, put them in an array (e.g. ["news", "pr"])
             */
            dataType?: EventRegistryStatic.DataType[] | EventRegistryStatic.DataType;
            minSentiment?: number;
            maxSentiment?: number;
            minSocialScore?: number;
            minFacebookShares?: number;
            startSourceRankPercentile?: number;
            endSourceRankPercentile?: number;
        }

        export interface ComplexEventQueryArguments {
            minSentiment?: number;
            maxSentiment?: number;
        }
    }

    export namespace QueryArticle {
        export interface RequestArticleSimilarArticlesArguments {
            /**
             * page of the articles
             */
            page?: number;
            /**
             * number of articles to return (at most 200)
             */
            count?: number;
            /**
             * in which language(s) should be the similar articles
             */
            lang?: string[];
            /**
             * max number of articles per language to return (-1 for no limit)
             */
            limitPerLang?: number;
            /**
             * what details should be included in the returned information
             */
            returnInfo?: ReturnInfo;
        }

        export interface RequestArticleDuplicatedArticlesArguments {
            /**
             * page of the articles
             */
            page?: number;
            /**
             * number of articles to return (at most 200)
             */
            count?: number;
            /**
             * how are the articles sorted.
             */
            sortBy?: "id" | "date" | "cosSim" | "fq" | "socialScore" | "facebookShares" | "twitterShares";
            /**
             * should the results be sorted in ascending order (true) or descending (false)
             */
            sortByAsc?: boolean;
            /**
             * what details should be included in the returned information
             */
            returnInfo?: ReturnInfo;
        }
    }

    // tslint:disable-next-line:no-shadowed-variable
    export namespace QueryArticles {
        export interface Arguments {
            /**
             * Find articles that mention the specified keywords.
             * A single keyword/phrase can be provided as a string, multiple keywords/phrases can be provided as a list of strings.
             * Use QueryItems.AND() if *all* provided keywords/phrases should be mentioned, or QueryItems.OR() if *any* of the keywords/phrases should be mentioned.
             * or QueryItems.OR() to specify a list of keywords where any of the keywords have to appear
             */
            keywords?: string | string[] | QueryItems;
            /**
             * Find articles where the concept with concept uri is mentioned.
             * A single concept uri can be provided as a string, multiple concept uris can be provided as a list of strings.
             * Use QueryItems.AND() if *all* provided concepts should be mentioned, or QueryItems.OR() if *any* of the concepts should be mentioned.
             * To obtain a concept uri using a concept label use EventRegistry.getConceptUri().
             */
            conceptUri?: string | string[] | QueryItems;
            /**
             * Find articles that are assigned into a particular category.
             * A single category can be provided as a string, while multiple categories can be provided as a list in QueryItems.AND() or QueryItems.OR().
             * A category uri can be obtained from a category name using EventRegistry.getCategoryUri().
             */
            categoryUri?: string | string[] | QueryItems;
            /**
             * find articles that were written by a news source sourceUri.
             * If multiple sources should be considered use QueryItems.OR() to provide the list of sources.
             * Source uri for a given news source name can be obtained using EventRegistry.getNewsSourceUri().
             */
            sourceUri?: string | string[] | QueryItems;
            /**
             * Find articles that were written by news sources located in the given geographic location.
             * If multiple source locations are provided, then put them into a list inside QueryItems.OR()
             * Location uri can either be a city or a country. Location uri for a given name can be obtained using EventRegistry.getLocationUri().
             */
            sourceLocationUri?: string | string[] | QueryItems;
            /**
             * Find articles that were written by news sources that are assigned to the specified source group.
             * If multiple source groups are provided, then put them into a list inside QueryItems.OR()
             * Source group uri for a given name can be obtained using EventRegistry.getSourceGroupUri().
             */
            sourceGroupUri?: string | string[] | QueryItems;
            /**
             * Find articles that were written by a specific author.
             * If multiple authors should be considered use QueryItems.OR() to provide the list of authors.
             * Author uri for a given author name can be obtained using EventRegistry.getAuthorUri().
             */
            authorUri?: string | string[] | QueryItems;
            /**
             * Find articles that describe something that occurred at a particular location.
             * If value can be a string or a list of strings provided in QueryItems.OR().
             * Location uri can either be a city or a country. Location uri for a given name can be obtained using EventRegistry.getLocationUri().
             */
            locationUri?: string | string[] | QueryItems;
            /**
             * find articles that are written in the specified language.
             * If more than one language is specified, resulting articles has to be written in *any* of the languages.
             */
            lang?: string | string[];
            /**
             * Find articles that were written on or after dateStart. Date should be provided in YYYY-MM-DD format.
             */
            dateStart?: string | Date;
            /**
             * Find articles that occurred before or on dateEnd. Date should be provided in YYYY-MM-DD format.
             */
            dateEnd?: string | Date;
            /**
             * Find articles that explicitly mention a date that is equal or greater than dateMentionStart.
             */
            dateMentionStart?: string | Date;
            /**
             * Find articles that explicitly mention a date that is lower or equal to dateMentionEnd.
             */
            dateMentionEnd?: string | Date;
            /**
             * Ignore articles that mention all provided keywords.
             */
            ignoreKeywords?: string | string[] | QueryItems;
            /**
             * Ignore articles that mention all provided concepts.
             */
            ignoreConceptUri?: string | string[] | QueryItems;
            /**
             * Ignore articles that are assigned to a particular category.
             */
            ignoreCategoryUri?: string | string[] | QueryItems;
            /**
             * Ignore articles that have been written by *any* of the specified news sources.
             */
            ignoreSourceUri?: string | string[] | QueryItems;
            /**
             * Ignore articles that have been written by sources located at *any* of the specified locations.
             */
            ignoreSourceLocationUri?: string | string[] | QueryItems;
            /**
             * Ignore articles that have been written by sources in *any* of the specified source groups.
             */
            ignoreSourceGroupUri?: string | string[] | QueryItems;
            /**
             * Ignore articles that were written by *any* of the specified authors.
             */
            ignoreAuthorUri?: string | string[] | QueryItems;
            /**
             * Ignore articles that occurred in any of the provided locations. A location can be a city or a place.
             */
            ignoreLocationUri?: string | string[] | QueryItems;
            /**
             * Ignore articles that are written in *any* of the provided languages.
             */
            ignoreLang?: string | string[] | QueryItems;
            /**
             * Where should we look when searching using the keywords provided by "keywords" parameter. "body" (default), "title", or "body,title".
             */
            keywordsLoc?: "body" | "title" | "body,title";
            /**
             * Where should we look when data should be used when searching using the keywords provided by "ignoreKeywords" parameter. "body" (default), "title", or "body,title".
             */
            ignoreKeywordsLoc?: "body" | "title" | "body,title";
            /**
             * Some articles can be duplicates of other articles. What should be done with them. Possible values are:
             *   "skipDuplicates" (skip the resulting articles that are duplicates of other articles)
             *   "keepOnlyDuplicates" (return only the duplicate articles)
             *   "keepAll" (no filtering, default)
             */
            isDuplicateFilter?: "skipDuplicates" | "keepOnlyDuplicates" | "keepAll";
            /**
             * Some articles are later copied by others. What should be done with such articles. Possible values are:
             *   "skipHasDuplicates" (skip the resulting articles that have been later copied by others)
             *   "keepOnlyHasDuplicates" (return only the articles that have been later copied by others)
             *   "keepAll" (no filtering, default)
             */
            hasDuplicateFilter?: "skipHasDuplicates" | "keepOnlyHasDuplicates" | "keepAll";
            /**
             * Some articles describe a known event and some don't. This filter allows you to filter the resulting articles based on this criteria.
             *   Possible values are:
             *   "skipArticlesWithoutEvent" (skip articles that are not describing any known event in ER)
             *   "keepOnlyArticlesWithoutEvent" (return only the articles that are not describing any known event in ER)
             *   "keepAll" (no filtering, default)
             */
            eventFilter?: "skipArticlesWithoutEvent" | "keepOnlyArticlesWithoutEvent" | "keepAll";
            /**
             * Starting percentile of the sources to consider in the results (default: 0). Value should be in range 0-90 and divisible by 10.
             */
            startSourceRankPercentile?: number;
            /**
             * Ending percentile of the sources to consider in the results (default: 100). Value should be in range 10-100 and divisible by 10.
             */
            endSourceRankPercentile?: number;
            /**
             * minimum value of the sentiment, that the returned articles should have. Range [-1, 1]. Note: setting the value will remove all articles that don't have a computed value for the sentiment (all non-English articles)
             */
            minSentiment?: number;
            /**
             * maximum value of the sentiment, that the returned articles should have. Range [-1, 1]. Note: setting the value will remove all articles that don't have a computed value for the sentiment (all non-English articles)
             */
            maxSentiment?: number;
            /**
             * what data types should we search? "news" (news content, default), "pr" (press releases), or "blogs".
             *   If you want to use multiple data types, put them in an array (e.g. ["news", "pr"])
             */
            dataType?: EventRegistryStatic.DataType[] | EventRegistryStatic.DataType;
            /**
             * The information to return as the result of the query. By default return the list of matching articles.
             */
            requestedResult?: RequestArticles;
        }
    }

    export namespace QueryEvent {

        /**
         * Sorting options:
         *  - undefined (no specific sorting),
         *  - id (internal id), date (published date),
         *  - cosSim (closeness to event centroid),
         *  - sourceImportance (manually curated score of source importance - high value,
         *  - high importance), sourceImportanceRank (reverse of sourceImportance),
         *  - sourceAlexaGlobalRank (global rank of the news source),
         *  - sourceAlexaCountryRank (country rank of the news source),
         *  - socialScore (total shares on social media),
         *  - facebookShares (shares on Facebook only)
         */
        export type SortByOptions = "id" | "date" | "cosSim" | "sourceImportance" | "sourceImportanceRank" | "sourceAlexaGlobalRank" | "sourceAlexaCountryRank" | "socialScore" | "facebookShares";

        // tslint:disable-next-line:no-empty-interface
        export interface RequestEvent {

        }
        export interface IteratorArguments {
            /**
             * Array or a single language in which to return the list of matching articles
             */
            lang?: string | string[];
            /**
             * Order in which event articles are sorted.
             */
            sortBy?: SortByOptions;
            /**
             * Should the results be sorted in ascending order (True) or descending (False)
             */
            sortByAsc?: boolean;
            /**
             * What details should be included in the returned information
             */
            returnInfo?: ReturnInfo;
            /**
             * Number of articles to download at once (we are not downloading article by article) (at most 100)
             */
            articleBatchSize?: number;
            /**
             * Maximum number of items to be returned. Used to stop iteration sooner than results run out
             */
            maxItems?: number;
            keywords?: string | string[] | QueryItems;
            conceptUri?: string | string[] | QueryItems;
            categoryUri?: string | string[] | QueryItems;
            sourceUri?: string | string[] | QueryItems;
            sourceLocationUri?: string | string[] | QueryItems;
            sourceGroupUri?: string | string[] | QueryItems;
            authorUri?: string | string[] | QueryItems;
            locationUri?: string | string[] | QueryItems;
            dateStart?: string | Date;
            dateEnd?: string | Date;
            dateMentionStart?: string | Date;
            dateMentionEnd?: string | Date;
            keywordsLoc?: "body" | "title" | "body,title";
            startSourceRankPercentile?: number;
            endSourceRankPercentile?: number;
            /**
             * minimum value of the sentiment, that the returned articles should have. Range [-1, 1]. Note: setting the value will remove all articles that don't have a computed value for the sentiment (all articles that are not reported in English language)
             */
            minSentiment?: number;
            /**
             * maximum value of the sentiment, that the returned articles should have. Range [-1, 1]. Note: setting the value will remove all articles that don't have a computed value for the sentiment (all articles that are not reported in English language)
             */
            maxSentiment?: number;
        }

        export interface RequestEventArticlesArguments {
            /**
             * page of the articles to return (1, 2, ...)
             */
            page?: number;
            /**
             * number of articles to return per page (at most 200)
             */
            count?: number;
            /**
             * a single language or an array of languages in which to return the articles
             */
            lang?: string | string[];
            /**
             * order in which event articles are sorted.
             */
            sortBy?: SortByOptions;
            /**
             * should the articles be sorted in ascending order (True) or descending (False) based on sortBy value
             */
            sortByAsc?: boolean;
            /**
             * what details should be included in the returned information
             */
            returnInfo?: ReturnInfo;
            keywords?: string | string[] | QueryItems;
            conceptUri?: string | string[] | QueryItems;
            categoryUri?: string | string[] | QueryItems;
            sourceUri?: string | string[] | QueryItems;
            sourceLocationUri?: string | string[] | QueryItems;
            sourceGroupUri?: string | string[] | QueryItems;
            authorUri?: string | string[] | QueryItems;
            locationUri?: string | string[] | QueryItems;
            dateStart?: string | Date;
            dateEnd?: string | Date;
            dateMentionStart?: string | Date;
            dateMentionEnd?: string | Date;
            keywordsLoc?: "body" | "title" | "body,title";
            startSourceRankPercentile?: number;
            endSourceRankPercentile?: number;
        }

        export interface RequestEventArticleUriWgtsArguments {
            /**
             * a single language or an array of languages in which to return the articles
             */
            lang?: string | string[];
            /**
             * order in which event articles are sorted.
             */
            sortBy?: SortByOptions;
            /**
             * should the articles be sorted in ascending order (True) or descending (False) based on sortBy value
             */
            sortByAsc?: boolean;
        }

        export interface RequestEventArticleTrendArguments {
            /**
             * languages for which to compute the trends
             */
            lang?: string | string[];
            /**
             * page of the articles for which to return information (1, 2, ...)
             */
            page?: number;
            /**
             * number of articles returned per page (at most 200)
             */
            count?: number;
            /**
             * ignore articles that have cos similarity to centroid lower than the specified value (-1 for no limit)
             */
            minArticleCosSim?: number;
            /**
             * what details should be included in the returned information
             */
            returnInfo?: ReturnInfo;
        }

        export interface RequestEventSimilarEventsArguments {
            /**
             * array of concepts and their importance, e.g. [{ "uri": "http://en.wikipedia.org/wiki/Barack_Obama", "wgt": 100 }, ...]
             */
            conceptInfoList?: Array<{uri: string, wgt: number}>;
            /**
             * number of similar events to return (at most 50)
             */
            count?: number;
            dateStart?: string;
            dateEnd?: string;
            /**
             * for the returned events compute how they were trending (intensity of reporting) in different time periods
             */
            addArticleTrendInfo?: boolean;
            /**
             * time span that is used as a unit when computing the trending info
             */
            aggrHours?: number;
            /**
             * include also the tested event in the results (True or False)
             */
            includeSelf?: boolean;
            /**
             * what details should be included in the returned information
             */
            returnInfo?: ReturnInfo;
        }
        export interface RequestEventSimilarStoriesArguments {
            /**
             * array of concepts and their importance, e.g. [{ "uri": "http://en.wikipedia.org/wiki/Barack_Obama", "wgt": 100 }, ...]
             */
            conceptInfoList?: Array<{uri: string, wgt: number}>;
            /**
             * number of similar stories to return (at most 5')
             */
            count?: number;
            /**
             * in what language(s) should be the returned stories
             */
            lang?: string | string[];
            /**
             * maximum difference in days between the returned stories and the tested event
             */
            maxDayDiff?: number;
            /**
             * what details should be included in the returned information
             */
            returnInfo?: ReturnInfo;
        }
    }
    export namespace QueryMentions {
        export interface Arguments {
            eventTypeUri?: string | string[] | QueryItems;
            keywords?: string | string[] | QueryItems;
            conceptUri?: string | string[] | QueryItems;
            categoryUri?: string | string[] | QueryItems;
            sourceUri?: string | string[] | QueryItems;
            sourceLocationUri?: string | string[] | QueryItems;
            sourceGroupUri?: string | string[] | QueryItems;
            industryUri?: string | string[] | QueryItems;
            locationUri?: string | string[] | QueryItems;
            lang?: string | string[];
            dateStart?: string | Date;
            dateEnd?: string | Date;
            ignoreEventTypeUri?: string | string[] | QueryItems;
            ignoreKeywords?: string | string[] | QueryItems;
            ignoreConceptUri?: string | string[] | QueryItems;
            ignoreCategoryUri?: string | string[] | QueryItems;
            ignoreSourceUri?: string | string[] | QueryItems;
            ignoreSourceLocationUri?: string | string[] | QueryItems;
            ignoreSourceGroupUri?: string | string[] | QueryItems;
            ignoreIndustryUri?: string | string[] | QueryItems;
            ignoreLocationUri?: string | string[] | QueryItems;
            ignoreLang?: string | string[];
            showDuplicates?: boolean;
            startSourceRankPercentile?: number;
            endSourceRankPercentile?: number;
            minSentiment?: number;
            maxSentiment?: number;
            requestedResult?: RequestMentions;
        }
        export interface IteratorArguments extends Arguments {
            [key: string]: any;
        }

        export interface RequestMentionsUriWgtListArguments {
            /**
             * page of the results to return (1, 2, ...)
             */
            page?: number;
            /**
             * number of results to return per page
             */
            count?: number;
            /**
             * how should the resulting events be sorted. Options:
             *  - none (no specific sorting),
             *  - date (by event date),
             *  - rel (relevance to the query),
             *  - size (number of articles),
             *  - socialScore (amount of shares in social media)
             */
            sortBy?: "none" | "rel" | "date" | "size" | "socialScore";
            /**
             * should the results be sorted in ascending order (true) or descending (false)
             */
            sortByAsc?: boolean;
        }

        export interface RequestMentionsConceptAggrArguments {
            /**
             * number of top concepts to return
             */
             conceptCount?: number;
             /**
              * on what sample of results should the aggregate be computed
              */
              mentionsSampleSize?: number;
             /**
              * what details about the concepts should be included in the returned information
              */
             returnInfo?: ReturnInfo;
             /**
              * how should the top concepts be computed. Possible values are
              * "importance" (takes into account how frequently a concept is mentioned and how relevant it is in an mention),
              * "frequency" (ranks the concepts simply by how frequently the concept is mentioned in the results) and
              * "uniqueness" (computes what are the top concepts that are frequently mentioned in the results of your search query but less frequently mentioned in the news in general)
              */
             conceptScoring?: "importance" | "frequency" | "uniqueness"
             /**
              * if you wish to limit the number of top concepts per type (person, org, loc, wiki) then set this to some number.
              * If you want to get equal number of concepts for each type then set conceptCountPerType to conceptCount/4 (since there are 4 concept types)
              */
             conceptCountPerType?: number;
        }

        export interface RequestMentionsCategoryAggrArguments {
            mentionsSampleSize?: number;
            returnInfo?: ReturnInfo;
        }

        export interface RequestMentionsSourceAggrArguments {
            sourceCount?: number;
            normalizeBySourceArts?: boolean;
            returnInfo?: ReturnInfo;
        }

        export interface RequestMentionsKeywordAggrArguments {
            mentionsSampleSize?: number;
        }

        export interface RequestMentionsConceptGraphArguments {
            /**
             * number of top sources to return
             */
            conceptCount?: number;
            linkCount?: number;
            /**
             * on what sample of results should the aggregate be computed
             */
             mentionsSampleSize?: number;
            /**
             * what details about the concepts should be included in the returned information
             */
            returnInfo?: ReturnInfo;
            skipQueryConcepts?: boolean;
        }

        export interface RequestMentionsRecentActivityArguments {
            /**
             * max mentions to return
             */
             maxMentionCount?: number;
             updatesAfterUri?: string;
             /**
              * the time after which the events were added/updated (returned by previous call to the same method)
              */
             updatesAfterTm?: string | Date;
             /**
              * how many minutes into the past should we check (set either this or updatesAfterTm property, but not both)
              */
             updatesAfterMinsAgo?: number;
             updatesUntilTm?: string | Date;
             updatesUntilMinsAgo?: number;
             /**
              * return only events that have a geographic location assigned to them
              */
              mandatorySourceLocation?: boolean;
             /**
              * what details should be included in the returned information
              */
             returnInfo?: ReturnInfo;
        }
    }

    export namespace QueryEvents {
        export interface Arguments {
            /**
             * find events where articles mention all the specified keywords.
             * A single keyword/phrase can be provided as a string,
             * multiple keywords/phrases can be provided as a list of strings.
             * Use QueryItems.AND() if *all* provided keywords/phrases should be mentioned,
             * or QueryItems.OR() if *any* of the keywords/phrases should be mentioned.
             */
            keywords?: string | string[] | QueryItems;
            /**
             *  find events where the concept with concept uri is important.
             * A single concept uri can be provided as a string, multiple concept uris
             * can be provided as a list of strings.
             * Use QueryItems.AND() if *all* provided concepts should be mentioned, or QueryItems.OR()
             * if *any* of the concepts should be mentioned.
             * To obtain a concept uri using a concept label use EventRegistry.getConceptUri().
             */
            conceptUri?: string | string[] | QueryItems;
            /**
             * find events that are assigned into a particular category.
             * A single category uri can be provided as a string, multiple category uris
             * can be provided as a list of strings.
             * Use QueryItems.AND() if *all* provided categories should be mentioned, or QueryItems.OR()
             * if *any* of the categories should be mentioned.
             * A category uri can be obtained from a category name using EventRegistry.getCategoryUri().
             */
            categoryUri?: string | string[] | QueryItems;
            /**
             * find events that contain one or more articles that have been written by a news source sourceUri.
             * If multiple sources should be considered use QueryItems.OR() to provide the list of sources.
             * Source uri for a given news source name can be obtained using EventRegistry.getNewsSourceUri().
             */
            sourceUri?: string | string[] | QueryItems;
            /**
             * find events that contain one or more articles that were written
             * by news sources located in the given geographic location.
             * If multiple source locations are provided, then put them into a list inside QueryItems.OR()
             * Location uri can either be a city or a country.
             * Location uri for a given name can be obtained using EventRegistry.getLocationUri().
             */
            sourceLocationUri?: string | string[] | QueryItems;
            /**
             * find events that contain one or more articles that were written
             * by news sources that are assigned to the specified source group.
             * If multiple source groups are provided, then put them into a list inside QueryItems.OR()
             * Source group uri for a given name can be obtained using EventRegistry.getSourceGroupUri().
             */
            sourceGroupUri?: string | string[] | QueryItems;
            /**
             * find events that contain one or more articles that have been written by a specific author.
             * If multiple authors should be considered use QueryItems.OR() or QueryItems.AND() to provide the list of authors.
             * Author uri for a given author name can be obtained using EventRegistry.getAuthorUri().
             */
            authorUri?: string | string[] | QueryItems;
            /**
             * find events that occurred at a particular location.
             * If value can be a string or a list of strings provided in QueryItems.OR().
             * Location uri can either be a city or a country.
             * Location uri for a given name can be obtained using EventRegistry.getLocationUri().
             */
            locationUri?: string | string[] | QueryItems;
            /**
             * find events for which we found articles in the specified language.
             * If more than one language is specified, resulting events has to be reported in *any* of the languages.
             */
            lang?: string | string[];
            /**
             * find events that occurred on or after dateStart. Date should be provided in YYYY-MM-DD format.
             */
            dateStart?: string | Date;
            /**
             * find events that occurred before or on dateEnd. Date should be provided in YYYY-MM-DD format.
             */
            dateEnd?: string | Date;
            /**
             * find events where the average date of the articles about this event is on or after this date. Date should be provided in YYYY-MM-DD format, datetime.time or datetime.datetime.
             */
            reportingDateStart?: string | Date;
            /**
             * find events where the average date of the articles about this event is on or before this date. Date should be provided in YYYY-MM-DD format, datetime.time or datetime.datetime.
             */
            reportingDateEnd?: string | Date;
            /**
             * minimum value of the sentiment, that the returned events should have. Range [-1, 1]. Note: setting the value will remove all events that don't have a computed value for the sentiment (all events that are not reported in English language)
             */
            minSentiment?: number;
            /**
             * maximum value of the sentiment, that the returned events should have. Range [-1, 1]. Note: setting the value will remove all events that don't have a computed value for the sentiment (all events that are not reported in English language)
             */
            maxSentiment?: number;
            /**
             * find events that have been reported in at least minArticlesInEvent articles (regardless of language)
             */
            minArticlesInEvent?: number;
            /**
             * find events that have not been reported in more than maxArticlesInEvent articles (regardless of language)
             */
            maxArticlesInEvent?: number;
            /**
             * find events where articles explicitly mention a date that is equal or greater than dateMentionStart.
             */
            dateMentionStart?: string | Date;
            /**
             * find events where articles explicitly mention a date that is lower or equal to dateMentionEnd.
             */
            dateMentionEnd?: string | Date;
            /**
             * ignore events where articles about the event mention any of the provided keywords
             */
            ignoreKeywords?: string | string[] | QueryItems;
            /**
             * ignore events that are about any of the provided concepts
             */
            ignoreConceptUri?: string | string[] | QueryItems;
            /**
             * ignore events that are about any of the provided categories
             */
            ignoreCategoryUri?: string | string[] | QueryItems;
            /**
             * ignore events that have have articles which have been written by any of the specified news sources
             */
            ignoreSourceUri?: string | string[] | QueryItems;
            /**
             * ignore events that have articles which been written by sources located at *any* of the specified locations
             */
            ignoreSourceLocationUri?: string | string[] | QueryItems;
            /**
             * ignore events that have articles which have been written by sources in *any* of the specified source groups
             */
            ignoreSourceGroupUri?: string | string[] | QueryItems;
            /**
             * ignore articles that were written by *any* of the specified authors
             */
            ignoreAuthorUri?: string | string[] | QueryItems;
            /**
             * ignore events that occurred in any of the provided locations. A location can be a city or a place
             */
            ignoreLocationUri?: string | string[] | QueryItems;
            /**
             * ignore events that are reported in any of the provided languages
             */
            ignoreLang?: string | string[];
            /**
             * what data should be used when searching using the keywords provided by "keywords" parameter.
             */
            keywordsLoc?: "body" | "title" | "body,title";
            /**
             *  what data should be used when searching using the keywords provided by "ignoreKeywords" parameter.
             */
            ignoreKeywordsLoc?: "body" | "title" | "body,title";
            /**
             * when a category is specified using categoryUri, should also all subcategories be included?
             */
            categoryIncludeSub?: boolean;
            /**
             * when a category is specified using ignoreCategoryUri, should also all subcategories be included?
             */
            ignoreCategoryIncludeSub?: boolean;
            /**
             *  the information to return as the result of the query. By default return the list of matching events
             */
            requestedResult?: RequestEvents;
        }
        export interface IteratorArguments extends Arguments {
            /**
             * how should the resulting events be sorted. Options:
             *  - none (no specific sorting),
             *  - date (by event date),
             *  - rel (relevance to the query),
             *  - size (number of articles),
             *  - socialScore (amount of shares in social media)
             */
            sortBy?: "none" | "rel" | "date" | "size" | "socialScore";
            /**
             * should the results be sorted in ascending order (true) or descending (false)
             */
            sortByAsc?: boolean;
            /**
             * number of events to download at once (we are not downloading event by event)
             */
            eventBatchSize?: number;
            /**
             * maximum number of items to be returned. Used to stop iteration sooner than results run out
             */
            maxItems?: number;
            returnInfo?: ReturnInfo;
        }
        export interface RequestEventsInfoArguments {
            /**
             * page of the results to return (1, 2, ...)
             */
            page?: number;
            /**
             * number of results to return per page
             */
            count?: number;
            /**
             * how should the resulting events be sorted. Options:
             *  - none (no specific sorting),
             *  - date (by event date),
             *  - rel (relevance to the query),
             *  - size (number of articles),
             *  - socialScore (amount of shares in social media)
             */
            sortBy?: "none" |  "rel" | "date" | "size" | "socialScore";
            /**
             * should the results be sorted in ascending order (true) or descending (false)
             */
            sortByAsc?: boolean;
            /**
             * what details should be included in the returned information
             */
            returnInfo?: ReturnInfo;
        }
        export interface RequestEventsUriListArguments {
            /**
             * page of the results to return (1, 2, ...)
             */
            page?: number;
            /**
             * number of results to return per page
             */
            count?: number;
            /**
             * how should the resulting events be sorted. Options:
             *  - none (no specific sorting),
             *  - date (by event date),
             *  - rel (relevance to the query),
             *  - size (number of articles),
             *  - socialScore (amount of shares in social media)
             */
            sortBy?: "none" |  "rel" | "date" | "size" | "socialScore";
            /**
             * should the results be sorted in ascending order (true) or descending (false)
             */
            sortByAsc?: boolean;
        }

        export interface RequestEventsUriWgtListArguments {
            /**
             * page of the results to return (1, 2, ...)
             */
            page?: number;
            /**
             * number of results to return per page
             */
            count?: number;
            /**
             * how should the resulting events be sorted. Options:
             *  - none (no specific sorting),
             *  - date (by event date),
             *  - rel (relevance to the query),
             *  - size (number of articles),
             *  - socialScore (amount of shares in social media)
             */
            sortBy?: "none" | "rel" | "date" | "size" | "socialScore";
            /**
             * should the results be sorted in ascending order (true) or descending (false)
             */
            sortByAsc?: boolean;
        }

        export interface RequestEventsLocAggrArguments {
            /**
             * sample of events to use to compute the location aggregate
             */
            eventsSampleSize?: number;
            /**
             * what details (about locations) should be included in the returned information
             */
            returnInfo?: ReturnInfo;
        }

        export interface RequestEventsLocTimeAggrArguments {
            /**
             * sample of events to use to compute the location aggregate
             */
            eventsSampleSize?: number;
            /**
             * what details (about locations) should be included in the returned information
             */
            returnInfo?: ReturnInfo;
        }

        export interface RequestEventsConceptAggrArguments {
            /**
             * number of top concepts to return
             */
            conceptCount?: number;
            /**
             * on what sample of results should the aggregate be computed
             */
            eventsSampleSize?: number;
            /**
             * what details about the concepts should be included in the returned information
             */
            returnInfo?: ReturnInfo;
        }
        export interface RequestEventsConceptGraphArguments {
            /**
             * number of top concepts to return
             */
            conceptCount?: number;
            /**
             * number of links between the concepts to return
             */
            linkCount?: number;
            /**
             * on what sample of results should the aggregate be computed
             */
            eventsSampleSize?: number;
            /**
             * what details about the concepts should be included in the returned information
             */
            returnInfo?: ReturnInfo;
        }

        export interface RequestEventsConceptMatrixArguments {
            /**
             * number of top concepts to return
             */
            conceptCount?: number;
            /**
             * how should the interestingness between the selected pairs of concepts be computed. Options: pmi (pointwise mutual information), pairTfIdf (pair frequence * IDF of individual concepts), chiSquare
             */
            measure?: "pmi" | "pairTfIdf" | "chiSquare";
            /**
             * on what sample of results should the aggregate be computed
             */
            eventsSampleSize?: number;
            /**
             * what details about the concepts should be included in the returned information
             */
            returnInfo?: ReturnInfo;
        }

        export interface RequestEventsConceptTrendsArguments {
            /**
             * number of top concepts to return
             */
            conceptCount?: number;
            /**
             * what details about the concepts should be included in the returned information
             */
            returnInfo?: ReturnInfo;
            /**
             * list of concept URIs for which to return trending information. If empty, then top concepts will be automatically computed.
             */
            conceptUris?: string[];
        }

        export interface RequestEventsSourceAggrArguments {
            /**
             * number of top sources to return
             */
            sourceCount?: number;
            /**
             * on what sample of results should the aggregate be computed
             */
            eventsSampleSize?: number;
            /**
             * what details about the concepts should be included in the returned information
             */
            returnInfo?: ReturnInfo;
        }

        export interface RequestEventsDateMentionAggrArguments {
            /**
             * ignore events that don't have a date that is more than this number of days apart from the tested event
             */
            minDaysApart?: number;
            /**
             *  report only dates that are mentioned at least this number of times
             */
            minDateMentionCount?: number;
            /**
             * on what sample of results should the aggregate be computed
             */
            eventsSampleSize?: number;
            /**
             * what details about the concepts should be included in the returned information
             */
            returnInfo?: ReturnInfo;
        }

        export interface RequestEventsEventClustersArguments {
            /**
             * number of keywords to report in each of the clusters
             */
            keywordCount?: number;
            /**
             * try to cluster at most this number of events
             */
            maxEventsToCluster?: number;
            /**
             * what details about the concepts should be included in the returned information
             */
            returnInfo?: ReturnInfo;
        }

        export interface RequestEventsRecentActivityArguments {
            /**
             * max events to return
             */
            maxEventCount?: number;
            /**
             * the time after which the events were added/updated (returned by previous call to the same method)
             */
            updatesAfterTm?: string | Date;
            /**
             * how many minutes into the past should we check (set either this or updatesAfterTm property, but not both)
             */
            updatesAfterMinsAgo?: number;
            /**
             * return only events that have a geographic location assigned to them
             */
            mandatoryLocation?: boolean;
            /**
             * the minimum avg cos sim of the events to be returned (events with lower quality should not be included)
             */
            minAvgCosSim?: number;
            /**
             * what details should be included in the returned information
             */
            returnInfo?: ReturnInfo;
        }
    }
    // tslint:disable-next-line:no-shadowed-variable
    export namespace ReturnInfo {
        /**
         * What information about an article should be returned by the API call
         */
        export interface ArticleInfo {
            /**
             * max length of the article body (use -1 for full body, 0 for empty)
             */
            bodyLen?: number;
            /**
             * core article information -
             */
            basicInfo?: boolean;
            /**
             * article title
             */
            title?: boolean;
            /**
             * article body
             */
            body?: boolean;
            /**
             * article url
             */
            url?: boolean;
            /**
             * uri of the event to which the article belongs
             */
            eventUri?: boolean;
            /**
             * the list of authors of the news article
             */
            authors?: boolean;
            /**
             * the list of concepts mentioned in the article
             */
            concepts?: boolean;
            /**
             * the list of categories assigned to the article
             */
            categories?: boolean;
            /**
             * the list of urls of links identified in the article body
             */
            links?: boolean;
            /**
             * the list of videos assigned to the article
             */
            videos?: boolean;
            /**
             * url to the image associated with the article
             */
            image?: boolean;
            /**
             * information about the number of times the article was shared on facebook and linkedin, instagram, ...
             */
            socialScore?: boolean;
            /**
             * sentiment about the article
             */
            sentiment?: boolean;
            /**
             * the geographic location that the event mentioned in the article is about
             */
            location?: boolean;
            /**
             * the dates when the articles was crawled and the date when it was published (based on the rss feed date)
             */
            dates?: boolean;
            /**
             * the list of dates found mentioned in the article
             */
            extractedDates?: boolean;
            /**
             * if the article is a duplicate, this will provide information about the original article
             */
            originalArticle?: boolean;
            /**
             * uri of the story (cluster) to which the article belongs
             */
            storyUri?: boolean;
            [name: string]: boolean | string | number;
        }

        /**
         * What information about an article should be returned by the API call
         */
        export interface ArticleInfoFlags {
            /**
             * max length of the article body (use -1 for full body, 0 for empty)
             */
            ArticleBodyLen?: number;
            /**
             * core article information -
             */
            IncludeArticleBasicInfo?: boolean;
            /**
             * article title
             */
            IncludeArticleTitle?: boolean;
            /**
             * article body
             */
            IncludeArticleBody?: boolean;
            /**
             * article url
             */
            IncludeArticleUrl?: boolean;
            /**
             * uri of the event to which the article belongs
             */
            IncludeArticleEventUri?: boolean;
            /**
             * the list of concepts mentioned in the article
             */
            IncludeArticleConcepts?: boolean;
            /**
             * the list of categories assigned to the article
             */
            IncludeArticleCategories?: boolean;
            /**
             * the list of urls of links identified in the article body
             */
            IncludeArticleLinks?: boolean;
            /**
             * the list of videos assigned to the article
             */
            IncludeArticleVideos?: boolean;
            /**
             * url to the image associated with the article
             */
            IncludeArticleImage?: boolean;
            /**
             * information about the number of times the article was shared on facebook and linkedin, instagram, ...
             */
            IncludeArticleSocialScore?: boolean;
            /**
             * sentiment about the article
             */
            IncludeArticleSentiment?: boolean;
            /**
             * the geographic location that the event mentioned in the article is about
             */
            IncludeArticleLocation?: boolean;
            /**
             * the dates when the articles was crawled and the date when it was published (based on the rss feed date)
             */
            IncludeArticleDates?: boolean;
            /**
             * the list of dates found mentioned in the article
             */
            IncludeArticleExtractedDates?: boolean;
            /**
             * the list of articles that are a copy of this article
             */
            IncludeArticleDuplicateList?: boolean;
            /**
             * if the article is a duplicate, this will provide information about the original article
             */
            IncludeArticleOriginalArticle?: boolean;
            /**
             * uri of the story (cluster) to which the article belongs
             */
            IncludeArticleStoryUri?: boolean;
        }

        /**
         * What information about a story (cluster of articles) should be returned by the API call
         */
        export interface StoryInfoFlags {
            /**
             * core stats about the story
             */
            IncludeStoryBasicStats?: boolean;
            /**
             * geographic location that the story is about
             */
            IncludeStoryLocation?: boolean;
            /**
             * date of the story
             */
            IncludeStoryDate?: boolean;
            /**
             * title of the story
             */
            IncludeStoryTitle?: boolean;
            /**
             * summary of the story
             */
            IncludeStorySummary?: boolean;
            /**
             * set of concepts associated with the story
             */
            IncludeStoryConcepts?: boolean;
            /**
             * categories associated with the story
             */
            IncludeStoryCategories?: boolean;
            /**
             * the article that is closest to the center of the cluster of articles assigned to the story
             */
            IncludeStoryMedoidArticle?: boolean;
            /**
             * dates that were frequently identified in the articles belonging to the story
             */
            IncludeStoryCommonDates?: boolean;
            /**
             * score computed based on how frequently the articles in the story were shared on social media
             */
            IncludeStorySocialScore?: boolean;
            /**
             * number of images to be returned for a story
             */
            StoryImageCount?: number;
        }

        /**
         * What information about a story (cluster of articles) should be returned by the API call
         */
        export interface StoryInfo {
            /**
             * core stats about the story
             */
            basicStats?: boolean;
            /**
             * geographic location that the story is about
             */
            location?: boolean;
            /**
             * date of the story
             */
            date?: boolean;
            /**
             * title of the story
             */
            title?: boolean;
            /**
             * summary of the story
             */
            summary?: boolean;
            /**
             * set of concepts associated with the story
             */
            concepts?: boolean;
            /**
             * categories associated with the story
             */
            categories?: boolean;
            /**
             * the article that is closest to the center of the cluster of articles assigned to the story
             */
            medoidArticle?: boolean;
            /**
             * the article from which we have extracted the title and summary for the story
             */
            infoArticle?: boolean;
            /**
             * dates that were frequently identified in the articles belonging to the story
             */
            commonDates?: boolean;
            /**
             * score computed based on how frequently the articles in the story were shared on social media
             */
            socialScore?: boolean;
            /**
             * number of images to be returned for a story
             */
            imageCount?: number;
            [name: string]: boolean | string | number;
        }

        /**
         * What information about an event should be returned by the API call
         */
        export interface EventInfoFlags {
            /**
             * return the title of the event
             */
            IncludeEventTitle?: boolean;
            /**
             * return the summary of the event
             */
            IncludeEventSummary?: boolean;
            /**
             * return the number of articles that are assigned to the event
             */
            IncludeEventArticleCounts?: boolean;
            /**
             * return information about the main concepts related to the event
             */
            IncludeEventConcepts?: boolean;
            /**
             * return information about the categories related to the event
             */
            IncludeEventCategories?: boolean;
            /**
             * return the location where the event occurred
             */
            IncludeEventLocation?: boolean;
            /**
             * return information about the date of the event
             */
            IncludeEventDate?: boolean;
            /**
             * return the dates that were commonly found in the articles about the event
             */
            IncludeEventCommonDates?: boolean;
            /**
             * return the list of stories (clusters) that are about the event
             */
            IncludeEventStories?: boolean;
            /**
             * score computed based on how frequently the articles in the event were shared on social media
             */
            IncludeEventSocialScore?: boolean;
            /**
             * number of images to be returned for an event
             */
            EventImageCount?: number;
        }

        /**
         * What information about an event should be returned by the API call
         */
        export interface EventInfo {
            /**
             * return the title of the event
             */
            title?: boolean;
            /**
             * return the summary of the event
             */
            summary?: boolean;
            /**
             * return the number of articles that are assigned to the event
             */
            articleCounts?: boolean;
            /**
             * return information about the main concepts related to the event
             */
            concepts?: boolean;
            /**
             * return information about the categories related to the event
             */
            categories?: boolean;
            /**
             * return information about the date of the event
             */
            date?: boolean;
            /**
             * return the dates that were commonly found in the articles about the event
             */
            commonDates?: boolean;
            /**
             * return for each language the article from which we have extracted the summary and title for event for that language
             */
            articleInfo?: boolean;
            /**
             * return the list of stories (clusters) that are about the event
             */
            stories?: boolean;
            /**
             * score computed based on how frequently the articles in the event were shared on social media
             */
            socialScore?: boolean;
            /**
             * number of images to be returned for an event
             */
            imageCount?: number;
            [name: string]: boolean | string | number;
        }

        /**
         * What information about a news source should be returned by the API call
         */
        export interface SourceInfoFlags {
            /**
             * title of the news source
             */
            IncludeSourceTitle?: boolean;
            /**
             * description of the news source
             */
            IncludeSourceDescription?: boolean;
            /**
             * geographic location of the news source
             */
            IncludeSourceLocation?: boolean;
            /**
             * a set of rankings for the news source
             */
            IncludeSourceRanking?: boolean;
            /**
             * different images associated with the news source
             */
            IncludeSourceImage?: boolean;
            /**
             * different social media accounts used by the news source
             */
            IncludeSourceSocialMedia?: boolean;
        }

        /**
         * What information about a news source should be returned by the API call
         */
        export interface SourceInfo {
            /**
             * title of the news source
             */
            title?: boolean;
            /**
             * description of the news source
             */
            description?: boolean;
            /**
             * geographic location of the news source
             */
            location?: boolean;
            /**
             * a set of rankings for the news source
             */
            ranking?: boolean;
            /**
             * different images associated with the news source
             */
            image?: boolean;
            /**
             * the number of articles from this news source that are stored in Event Registry
             */
            articleCount?: boolean;
            /**
             * different social media accounts used by the news source
             */
            socialMedia?: boolean;
            /**
             * info about the names of the source groups to which the source belongs to
             */
            sourceGroups?: boolean;
            [name: string]: boolean | string | number;
        }

        /**
         * What information about a category should be returned by the API call
         */
        export interface CategoryInfoFlags {
            IncludeCategoryTrendingScore?: boolean;
        }

        /**
         * What information about a category should be returned by the API call
         */
        export interface CategoryInfo {
            trendingScore?: boolean;
            [name: string]: boolean | string | number;
        }

        export interface ConceptInfoFlags {
            ConceptType?: ConceptType;
            lang?: string | string[];
            IncludeConceptLabel?: boolean;
            IncludeConceptSynonyms?: boolean;
            IncludeConceptImage?: boolean;
            IncludeConceptDescription?: boolean;
            IncludeConceptTrendingScore?: boolean;
            MaxConceptsPerType?: number;
        }

        export interface ConceptInfo {
            type?: ConceptType | ConceptType[];
            lang?: string | string[];
            label?: boolean;
            synonyms?: boolean;
            image?: boolean;
            description?: boolean;
            trendingScore?: boolean;
            maxConceptsPerType?: number;
            [name: string]: boolean | string | number | (boolean | string | number)[];
        }

        export interface LocationInfoFlags {
            label?: boolean;
            wikiUri?: boolean;
            geoNamesId?: boolean;
            population?: boolean;
            geoLocation?: boolean;
            countryArea?: boolean;
            countryDetails?: boolean;
            countryContinent?: boolean;
            placeFeatureCode?: boolean;
            placeCountry?: boolean;
        }

        export interface LocationInfo {
            label?: boolean;
            wikiUri?: boolean;
            geoNamesId?: boolean;
            population?: boolean;
            geoLocation?: boolean;
            countryArea?: boolean;
            countryDetails?: boolean;
            countryContinent?: boolean;
            placeFeatureCode?: boolean;
            placeCountry?: boolean;
            [name: string]: boolean | string | number;
        }

        export interface ConceptClassInfoFlags {
            IncludeConceptClassParentLabels?: boolean;
            IncludeConceptClassConcepts?: boolean;
        }

        export interface ConceptClassInfo {
            parentLabels?: boolean;
            concepts?: boolean;
            [name: string]: boolean | string | number;
        }

        export interface ConceptFolderInfoFlags {
            IncludeConceptFolderDefinition?: boolean;
            IncludeConceptFolderOwner?: boolean;
        }

        export interface ConceptFolderInfo {
            definition?: boolean;
            owner?: boolean;
            [name: string]: boolean | string | number;
        }
    }

}
