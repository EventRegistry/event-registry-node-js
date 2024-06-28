import * as fs from "fs";
import { QueryParamsBase } from "./base";
import { EventRegistry } from "./eventRegistry";
import { ReturnInfo } from "./returnInfo";
import { ER } from "./types";
import { AxiosResponse } from "axios";

export class TopicPage extends QueryParamsBase {
    private topicPage: ER.TopicPage;
    private readonly emptyTopicPage: ER.TopicPage = {
        autoAddArticles: true,
        articleHasDuplicate: "keepAll",
        articleHasEvent: "keepAll",
        articleIsDuplicate: "skipDuplicates",
        maxDaysBack: 7,
        articleTreshWgt: 0,
        eventTreshWgt: 0,
        concepts: [],
        keywords: [],
        categories: [],
        sources: [],
        sourceGroups: [],
        sourceLocations: [],
        locations: [],
        langs: [],
        restrictToSetConcepts: false,
        restrictToSetCategories: false,
        restrictToSetSources: false,
        restrictToSetLocations: false,
        dataType: [ "news" ]
    };
    private concept: AxiosResponse<ER.Response> = {} as AxiosResponse<ER.Response>;

    constructor(private eventRegistry: EventRegistry) {
        super();
        this.topicPage = this.createEmptyTopicPage();
    }

    private isTopicPage(definition: {[name: string]: any}): definition is ER.TopicPage {
        return Object.keys(this.emptyTopicPage).sort().toString() === Object.keys(definition).sort().toString();
    }

    private createEmptyTopicPage(): ER.TopicPage {
        return this.emptyTopicPage;
    }

    /**
     * Load an existing topic page from Event Registry based on the topic page URI
     * @param uri uri of the topic page saved in your Event Registry account
     */
    public async loadTopicPageFromER(uri: string) {
        const params = {
            action: "getTopicPageJson",
            includeConceptDescription: true,
            includeConceptImage: true,
            includeTopicPageDefinition: true,
            includeTopicPageOwner: true,
            uri: uri
        };
        this.topicPage = this.createEmptyTopicPage();
        this.concept = await this.eventRegistry.jsonRequest("/api/v1/topicPage", params);
        if (this.concept?.data?.error) {
            throw new Error(this.concept.data.error || "");
        }
        this.topicPage = {...this.topicPage, ...(this.concept.data?.topicPage || {})};
        return this.topicPage;
    }

    /**
     * Load the topic page definition from an object
     * @param definition topic page definition
     */
    public loadTopicPageFromDefinition(definition: {}) {
        if (this.isTopicPage(definition)) {
            this.topicPage = definition;
        }
    }

    /**
     * Load topic page from an existing file
     * @param filepath file that contains the topic page definition
     */
    public loadTopicPageFromFile(filepath: string) {
        if (fs && fs.existsSync(filepath)) {
            const definition = JSON.parse(fs.readFileSync(filepath, "utf8"));
            if (this.isTopicPage(definition)) {
                this.topicPage = definition;
            }
        }
    }

    /**
     * Return an object containing the topic page definition. you can use it to load a topic page later
     */
    public saveTopicPageDefinition(): ER.TopicPage {
        return this.topicPage;
    }

    /**
     * Save the topic page definition to a file
     * @param filepath location of the file to which you'll save the topic page definition
     */
    public saveTopicPageDefinitionToFile(filepath: string) {
        fs.writeFileSync(filepath, JSON.stringify(this.topicPage, null, 4), "utf8");
    }

    /**
     * What is the minimum total weight that an article has to have in order to get it among the results?
     */
    public set articleThreshold(value: number) {
        if (typeof value === "number" && value >= 0) {
            this.topicPage.articleTreshWgt = value;
        }
    }

    /**
     * What is the minimum total weight that an event has to have in order to get it among the results?
     */
    public set eventThreshold(value: number) {
        if (typeof value === "number" && value >= 0) {
            this.topicPage.eventTreshWgt = value;
        }
    }

    /**
     * Some articles can be duplicates of other articles. What should be done with them. Possible values are:
     * "skipDuplicates" (skip the resulting articles that are duplicates of other articles),
     * "keepOnlyDuplicates" (return only the duplicate articles) and
     * "keepAll" (no filtering, default)
     */
    public set articleIsDuplicateFilter(value: "skipDuplicates" | "keepOnlyDuplicates" | "keepAll") {
        if (value === "skipDuplicates" || value === "keepOnlyDuplicates" || value === "keepAll") {
            this.topicPage.articleIsDuplicate = value;
        }
    }

    /**
     * Some articles describe a known event and some don't. This filter allows you to filter the resulting articles based on this criteria.
     * Possible values are:
     * "skipArticlesWithoutEvent" (skip articles that are not describing any known event in ER),
     * "keepOnlyArticlesWithoutEvent" (return only the articles that are not describing any known event in ER) and
     * "keepAll" (no filtering, default)
     */
    public set articleHasEventFilter(value: "skipArticlesWithoutEvent" | "keepOnlyArticlesWithoutEvent" | "keepAll") {
        if (value === "skipArticlesWithoutEvent" || value === "keepOnlyArticlesWithoutEvent" || value === "keepAll") {
            this.topicPage.articleHasEvent = value;
        }
    }

    /**
     * Some articles are later copied by others. What should be done with such articles. Possible values are:
     * "skipHasDuplicates" (skip the articles that have been later copied by others),
     * "keepOnlyHasDuplicates" (return only the articles that have been later copied by others) and
     * "keepAll" (no filtering, default)
     */
    public set articleHasDuplicateFilter(value: "skipHasDuplicates" | "keepOnlyHasDuplicates" | "keepAll") {
        if (value === "skipHasDuplicates" || value === "keepOnlyHasDuplicates" || value === "keepAll") {
            this.topicPage.articleHasDuplicate = value;
        }
    }

    /**
     * What data types should we search? "news" (news content, default), "pr" (press releases), or "blog".
     * If you want to use multiple data types, put them in an array (e.g. ["news", "pr"])
     */
    public set dataTypes(dataTypes: ER.DataType | ER.DataType[]) {
        this.topicPage.dataType = dataTypes;
    }

    public set sourceRankStartPercentile(startPercentile: number) {
        if (startPercentile === undefined) {
            startPercentile = 0;
        }

        if (startPercentile < 0 || startPercentile > 90) {
            throw new RangeError("startPercentile is out of valid values (0 - 90)");
        }

        if (this.topicPage.endSourceRankPercentile !== null && typeof this.topicPage.endSourceRankPercentile === "number" && startPercentile >= this.topicPage.endSourceRankPercentile) {
            throw new RangeError("startPercentile has to be smaller than endPercentile");
        }

        if (startPercentile % 10 !== 0) {
            throw new Error("startPecentile has to be a multiple of 10");
        }

        this.topicPage.startSourceRankPercentile = startPercentile;
    }

    public set sourceRankEndPercentile(endPercentile: number) {
        if (endPercentile === undefined) {
            endPercentile = 100;
        }

        if (endPercentile < 10 || endPercentile > 100) {
            throw new RangeError("endPercentile is out of valid values (10 - 100)");
        }

        if (this.topicPage.startSourceRankPercentile !== null && typeof this.topicPage.startSourceRankPercentile === 'number' && this.topicPage.startSourceRankPercentile >= endPercentile) {
            throw new RangeError("startPercentile has to be smaller than endPercentile");
        }

        if (endPercentile % 10 !== 0) {
            throw new Error("endPercentile has to be a multiple of 10");
        }
        this.topicPage.endSourceRankPercentile = endPercentile;
    }

    /**
     * What is the maximum allowed age of the results?
     */
    public set maxDaysBack(maxDaysBack: number) {
        if (typeof maxDaysBack !== "number" || maxDaysBack < 0) {
            throw new Error("maxDaysBack value has to be a positive number");
        }
        if (maxDaysBack <= 0) {
            throw new RangeError("maxDaysBack value has to be a positive number");
        }
        this.topicPage.maxDaysBack = maxDaysBack;
    }

    public clearConcepts() {
        this.topicPage.concepts = [];
    }

    public clearKeywords() {
        this.topicPage.keywords = [];
    }

    public clearCategories() {
        this.topicPage.categories = [];
    }

    public clearSources() {
        this.topicPage.sources = [];
    }

    public clearSourceLocations() {
        this.topicPage.sourceLocations = [];
    }

    public clearSourceGroups() {
        this.topicPage.sourceGroups = [];
    }

    public clearLocations() {
        this.topicPage.locations = [];
    }

    /**
     * Add a relevant concept to the topic page
     * @param uri uri of the concept to be added
     * @param weight importance of the provided concept (typically in range 1 - 50)
     */
    public addConcept(uri: string, wgt: number, args: ER.TopicPageAddConceptArguments = {}) {
        if (typeof wgt !== "number") {
            throw new Error("Weight value has to be a positive or negative number");
        }
        const {
            label,
            conceptType,
            required = false,
            excluded = false,
        } = args;
        if (required && excluded) {
            throw new Error("Parameters required and excluded can not be true at the same time");
        }
        const concept: Record<string, string | number | boolean>  = { uri, wgt, required, excluded };
        if (label !== undefined) {
            concept.label = label;
        }
        if (conceptType !== undefined) {
            concept.type = conceptType;
        }
        this.topicPage.concepts = [...this.topicPage.concepts, concept];
    }

    /**
     * Add a relevant keyword to the topic page
     * @param keyword keyword or phrase to be added
     * @param weight importance of the provided keyword (typically in range 1 - 50)
     */
    public addKeyword(keyword: string, wgt: number, args: ER.TopicPageAddKeywordArguments = {}) {
        if (typeof wgt !== "number") {
            throw new Error("Weight value has to be a positive or negative number");
        }
        const {
            required = false,
            excluded = false,
        } = args;
        this.topicPage.keywords = [...this.topicPage.keywords, {keyword, wgt, required, excluded}];
    }

    /**
     * Add a relevant category to the topic page
     * @param uri uri of the category to be added
     * @param weight importance of the provided category (typically in range 1 - 50)
     */
    public addCategory(uri: string, wgt: number, args: ER.TopicPageAddCategoryArguments = {}) {
        if (typeof wgt !== "number") {
            throw new Error("Weight value has to be a positive or negative number");
        }
        const {
            required = false,
            excluded = false,
        } = args;
        this.topicPage.categories = [...this.topicPage.categories, {uri, wgt, required, excluded}];
    }

    /**
     * Add a news source to the topic page
     * @param uri uri of the news source to add to the topic page
     * @param weight importance of the news source (typically in range 1 - 50)
     */
    public addSource(uri: string, wgt: number, args: ER.TopicPageAddSourceArguments = {}) {
        if (typeof wgt !== "number") {
            throw new Error("Weight value has to be a positive or negative number");
        }
        const {
            excluded = false,
        } = args;
        this.topicPage.sources = [...this.topicPage.sources, {uri, wgt, excluded}];
    }

    /**
     * Add a list of relevant sources by identifying them by their geographic location
     * @param uri uri of the location where the sources should be geographically located
     * @param weight importance of the provided list of sources (typically in range 1 - 50)
     */
    public addSourceLocation(uri: string, wgt: number, args: ER.TopicPageAddSourceLocationArguments = {}) {
        if (typeof wgt !== "number") {
            throw new Error("Weight value has to be a positive or negative number");
        }
        const {
            excluded = false,
        } = args;
        this.topicPage.sourceLocations = [...this.topicPage.sourceLocations, {uri, wgt, excluded}];
    }

    /**
     * Add a list of relevant sources by specifying a whole source group to the topic page
     * @param sourceGroupUri uri of the source group to add
     * @param weight importance of the provided list of sources (typically in range 1 - 50)
     */
    public addSourceGroup(uri: string, wgt: number, args: ER.TopicPageAddSourceGroupArguments = {}) {
        if (typeof wgt !== "number") {
            throw new Error("Weight value has to be a positive or negative number");
        }
        const {
            excluded = false,
        } = args;
        this.topicPage.sourceGroups = [...this.topicPage.sourceGroups, {uri, wgt, excluded}];
    }

    /**
     * Add relevant location to the topic page
     * @param locationUri uri of the location to add
     * @param weight importance of the provided location (typically in range 1 - 50)
     */
    public addLocation(locationUri: string, weight: number) {
        if (typeof weight !== "number") {
            throw new Error("Weight value has to be a positive or negative number");
        }
        this.topicPage.locations = [...this.topicPage.locations, {uri: locationUri, wgt: weight}];
    }

    /**
     * Restrict the results to the list of specified languages
     */
    public set languages(languages: string | string[]) {
        if (!Array.isArray(languages)) {
            languages = [languages];
        }
        if (languages.every((language) => language.length === 3)) {
            this.topicPage.langs = languages;
        } else {
            throw new Error("Expected to get language in ISO3 code");
        }
    }

    /**
     * if true then the results have to mention at least one of the specified concepts or keywords
     */
    public set restrictToSetConceptsAndKeywords(restrict: boolean) {
        if (typeof restrict !== "boolean") {
            throw new Error("Restrict value has to be a boolean value");
        }
        this.topicPage.restrictToSetConcepts = restrict;
    }

    /**
     * if set to true then return only results that are assigned to one of the specified categories
     */
    public set restrictToSetCategories(restrict: boolean) {
        if (typeof restrict !== "boolean") {
            throw new Error("Restrict value has to be a boolean value");
        }
        this.topicPage.restrictToSetCategories = restrict;
    }

    /**
     * if set to true then return only results from one of the specified news sources
     * this includes also sources set by source groups or by source locations
     */
    public set restrictToSetSources(restrict: boolean) {
        if (typeof restrict !== "boolean") {
            throw new Error("Restrict value has to be a boolean value");
        }
        this.topicPage.restrictToSetSources = restrict;
    }

    /**
     * if set to true, then return only results that are located at one of the specified locations
     */
    public set restrictToSetLocations(restrict: boolean) {
        if (typeof restrict !== "boolean") {
            throw new Error("Restrict value has to be a boolean value");
        }
        this.topicPage.restrictToSetLocations = restrict;
    }

    /**
     * Return a list of articles that match the topic page
     * @param args {ER.TopicPageArticles} Object which contains a host of optional parameters
     */
    public async getArticles(args: ER.TopicPageArticles = {}) {
        const {page = 1, count = 100, sortBy = "rel", sortByAsc = false, dataType = "news", returnInfo = new ReturnInfo(), ...otherParameters} = args;
        if (page < 1) {
            throw new RangeError("page has to be >= 1");
        }
        if (count > 100) {
            throw new RangeError("At most 100 articles can be returned at a time");
        }
        let params = {
            action: "getArticlesForTopicPage",
            resultType: "articles",
            dataType: this.topicPage.dataType,
            articlesCount: count,
            articlesSortBy: sortBy,
            articlesSortByAsc: sortByAsc,
            articlesPage: page,
            topicPage: JSON.stringify(this.topicPage),
            ...returnInfo.getParams()
        };
        if (Object.keys(otherParameters).length > 0) {
            params = {...params, ...otherParameters};
        }
        const request = await this.eventRegistry.jsonRequest("/api/v1/article", params);
        return request?.data ?? {articles: {results: []}};
    }
    /**
     * Return a list of events that match the topic page
     * @param args {ER.TopicPageEvents} Object which contains a host of optional parameters
     */
    public async getEvents(args: ER.TopicPageEvents = {}) {
        const {page = 1, count = 50, sortBy = "rel", sortByAsc = false, returnInfo = new ReturnInfo(), ...otherParameters} = args;
        if (page < 1) {
            throw new RangeError("page has to be >= 1");
        }
        if (count > 50) {
            throw new RangeError("At most 50 events can be returned at a time");
        }
        let params = {
            action: "getEventsForTopicPage",
            resultType: "events",
            dataType: this.topicPage.dataType,
            eventsCount: count,
            eventsSortBy: sortBy,
            eventsSortByAsc: sortByAsc,
            eventsPage: page,
            topicPage: JSON.stringify(this.topicPage),
            ...returnInfo.getParams()
        };
        if (Object.keys(otherParameters).length > 0) {
            params = {...params, ...otherParameters};
        }
        const request = await this.eventRegistry.jsonRequest("/api/v1/event", params);
        return request?.data ?? {events: {results: []}};
    }

}
