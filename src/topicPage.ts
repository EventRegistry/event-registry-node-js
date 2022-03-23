import * as fs from "fs";
import * as _ from "lodash";
import { QueryParamsBase } from "./base";
import { EventRegistry } from "./eventRegistry";
import { ReturnInfo } from "./returnInfo";
import { EventRegistryStatic } from "./types";

export class TopicPage extends QueryParamsBase {
    private topicPage: EventRegistryStatic.TopicPage;
    private readonly emptyTopicPage: EventRegistryStatic.TopicPage = {
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
    private concept = {};

    constructor(private eventRegistry: EventRegistry) {
        super();
        this.topicPage = this.createEmptyTopicPage();
    }

    private isTopicPage(definition: {[name: string]: any}): definition is EventRegistryStatic.TopicPage {
        return _.isEqual(_.keys(this.emptyTopicPage), _.keys(definition));
    }

    private createEmptyTopicPage(): EventRegistryStatic.TopicPage {
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
        if (_.has(this.concept, "data.error")) {
            throw new Error(_.get(this.concept, "data.error", ""));
        }
        this.topicPage = _.extend({}, this.topicPage, _.get(this.concept, "data.topicPage", {}));
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
    public saveTopicPageDefinition(): EventRegistryStatic.TopicPage {
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
        if (_.isNumber(value) && value >= 0) {
            this.topicPage.articleTreshWgt = value;
        }
    }

    /**
     * What is the minimum total weight that an event has to have in order to get it among the results?
     */
    public set eventThreshold(value: number) {
        if (_.isNumber(value) && value >= 0) {
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
    public set dataTypes(dataTypes: EventRegistryStatic.DataType | EventRegistryStatic.DataType[]) {
        this.topicPage.dataType = dataTypes;
    }

    public set sourceRankStartPercentile(startPercentile: number) {
        if (_.isUndefined(startPercentile)) {
            startPercentile = 0;
        }

        if (startPercentile < 0 || startPercentile > 90) {
            throw new RangeError("startPercentile is out of valid values (0 - 90)");
        }

        if (!_.isNil(this.topicPage.endSourceRankPercentile) && _.isNumber(this.topicPage.endSourceRankPercentile) && startPercentile >= this.topicPage.endSourceRankPercentile ) {
            throw new RangeError("startPercentile has to be smaller than endPercentile");
        }

        if (startPercentile % 10 !== 0) {
            throw new Error("startPecentile has to be a multiple of 10");
        }

        this.topicPage.startSourceRankPercentile = startPercentile;
    }

    public set sourceRankEndPercentile(endPercentile: number) {
        if (_.isUndefined(endPercentile)) {
            endPercentile = 100;
        }

        if (endPercentile < 10 || endPercentile > 100) {
            throw new RangeError("endPercentile is out of valid values (10 - 100)");
        }

        if (!_.isNil(this.topicPage.startSourceRankPercentile) && _.isNumber(this.topicPage.startSourceRankPercentile) && this.topicPage.startSourceRankPercentile >= endPercentile ) {
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
        if (!_.isNumber(maxDaysBack)) {
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
    public addConcept(uri: string, wgt: number, args: EventRegistryStatic.TopicPageAddConceptArguments = {}) {
        if (!_.isNumber(wgt)) {
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
        const concept  = { uri, wgt, required, excluded };
        if (!_.isUndefined(label)) {
            _.set(concept, "label", label);
        }
        if (!_.isUndefined(conceptType)) {
            _.set(concept, "type", conceptType);
        }
        this.topicPage.concepts = [...this.topicPage.concepts, concept];
    }

    /**
     * Add a relevant keyword to the topic page
     * @param keyword keyword or phrase to be added
     * @param weight importance of the provided keyword (typically in range 1 - 50)
     */
    public addKeyword(keyword: string, wgt: number, args: EventRegistryStatic.TopicPageAddKeywordArguments = {}) {
        if (!_.isNumber(wgt)) {
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
    public addCategory(uri: string, wgt: number, args: EventRegistryStatic.TopicPageAddCategoryArguments = {}) {
        if (!_.isNumber(wgt)) {
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
    public addSource(uri: string, wgt: number, args: EventRegistryStatic.TopicPageAddSourceArguments = {}) {
        if (!_.isNumber(wgt)) {
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
    public addSourceLocation(uri: string, wgt: number, args: EventRegistryStatic.TopicPageAddSourceLocationArguments = {}) {
        if (!_.isNumber(wgt)) {
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
    public addSourceGroup(uri: string, wgt: number, args: EventRegistryStatic.TopicPageAddSourceGroupArguments = {}) {
        if (!_.isNumber(wgt)) {
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
        if (!_.isNumber(weight)) {
            throw new Error("Weight value has to be a positive or negative number");
        }
        this.topicPage.locations = [...this.topicPage.locations, {uri: locationUri, wgt: weight}];
    }

    /**
     * Restrict the results to the list of specified languages
     */
    public set languages(languages: string | string[]) {
        if (!_.isArray(languages)) {
            languages = [languages];
        }
        if (_.every(languages, (language) => _.size(language) === 3)) {
            this.topicPage.langs = languages;
        } else {
            throw new Error("Expected to get language in ISO3 code");
        }
    }

    /**
     * if true then the results have to mention at least one of the specified concepts or keywords
     */
    public set restrictToSetConceptsAndKeywords(restrict: boolean) {
        if (!_.isBoolean(restrict)) {
            throw new Error("Restrict value has to be a boolean value");
        }
        this.topicPage.restrictToSetConcepts = restrict;
    }

    /**
     * if set to true then return only results that are assigned to one of the specified categories
     */
    public set restrictToSetCategories(restrict: boolean) {
        if (!_.isBoolean(restrict)) {
            throw new Error("Restrict value has to be a boolean value");
        }
        this.topicPage.restrictToSetCategories = restrict;
    }

    /**
     * if set to true then return only results from one of the specified news sources
     * this includes also sources set by source groups or by source locations
     */
    public set restrictToSetSources(restrict: boolean) {
        if (!_.isBoolean(restrict)) {
            throw new Error("Restrict value has to be a boolean value");
        }
        this.topicPage.restrictToSetSources = restrict;
    }

    /**
     * if set to true, then return only results that are located at one of the specified locations
     */
    public set restrictToSetLocations(restrict: boolean) {
        if (!_.isBoolean(restrict)) {
            throw new Error("Restrict value has to be a boolean value");
        }
        this.topicPage.restrictToSetLocations = restrict;
    }

    /**
     * Return a list of articles that match the topic page
     * @param args {EventRegistryStatic.TopicPageArticles} Object which contains a host of optional parameters
     */
    public async getArticles(args: EventRegistryStatic.TopicPageArticles = {}) {
        const {page = 1, count = 100, sortBy = "rel", sortByAsc = false, dataType = "news", returnInfo = new ReturnInfo(), ...otherParameters} = args;
        if (page < 1) {
            throw new RangeError("page has to be >= 1");
        }
        if (count > 100) {
            throw new RangeError("At most 100 articles can be returned at a time");
        }
        let params = _.extend({}, {
            action: "getArticlesForTopicPage",
            resultType: "articles",
            dataType: this.topicPage.dataType,
            articlesCount: count,
            articlesSortBy: sortBy,
            articlesSortByAsc: sortByAsc,
            articlesPage: page,
            topicPage: JSON.stringify(this.topicPage),
        }, returnInfo.getParams());
        if (!_.isEmpty(otherParameters)) {
            params = {...params, ...otherParameters};
        }
        const request = await this.eventRegistry.jsonRequest("/api/v1/article", params);
        return _.get(request, "data", {articles: {results: []}});
    }
    /**
     * Return a list of events that match the topic page
     * @param args {EventRegistryStatic.TopicPageEvents} Object which contains a host of optional parameters
     */
    public async getEvents(args: EventRegistryStatic.TopicPageEvents = {}) {
        const {page = 1, count = 50, sortBy = "rel", sortByAsc = false, returnInfo = new ReturnInfo(), ...otherParameters} = args;
        if (page < 1) {
            throw new RangeError("page has to be >= 1");
        }
        if (count > 50) {
            throw new RangeError("At most 50 events can be returned at a time");
        }
        let params = _.extend({}, {
            action: "getEventsForTopicPage",
            resultType: "events",
            dataType: this.topicPage.dataType,
            eventsCount: count,
            eventsSortBy: sortBy,
            eventsSortByAsc: sortByAsc,
            eventsPage: page,
            topicPage: JSON.stringify(this.topicPage),
        }, returnInfo.getParams());
        if (!_.isEmpty(otherParameters)) {
            params = {...params, ...otherParameters};
        }
        const request = await this.eventRegistry.jsonRequest("/api/v1/event", params);
        return _.get(request, "data", {events: {results: []}});
    }

}
