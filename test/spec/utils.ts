import * as _ from "lodash";
import {
    ArticleInfoFlags,
    CategoryInfoFlags,
    ConceptInfoFlags,
    EventInfoFlags,
    EventRegistry,
    LocationInfoFlags,
    QueryArticles,
    QueryEvents,
    RequestArticlesUriWgtList,
    RequestEventsUriWgtList,
    ReturnInfo,
    SourceInfoFlags,
    StoryInfoFlags,

} from "../../src/index";

interface ValidationObj {
    pass: boolean;
    message?: string;
}

export class Utils {

    public articleInfo;
    public sourceInfo;
    public conceptInfo;
    public locationInfo;
    public categoryInfo;
    public eventInfo;
    public storyInfo;
    public returnInfo: ReturnInfo;
    public er: EventRegistry;

    constructor() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
        this.articleInfo = new ArticleInfoFlags({ bodyLen: -1,
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
                                                });
        this.sourceInfo = new SourceInfoFlags({ description: true,
                                                location: true,
                                                ranking: true,
                                                articleCount: true,
                                                sourceGroups: true,
                                              });
        this.conceptInfo = new ConceptInfoFlags({ type: ["entities"],
                                                  lang: ["eng", "spa"],
                                                  synonyms: true,
                                                  image: true,
                                                  description: true,
                                                  conceptClassMembership: true,
                                                  trendingScore: true,
                                                  trendingHistory: true,
                                                  maxConceptsPerType: 50,
                                                });
        this.locationInfo = new LocationInfoFlags({ wikiUri: true,
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
        this.categoryInfo = new CategoryInfoFlags({ parentUri: true, childrenUris: true, trendingScore: true, trendingHistory: true });
        this.eventInfo = new EventInfoFlags({ commonDates: true, stories: true, socialScore: true, imageCount: 2 });
        this.storyInfo = new StoryInfoFlags({ categories: true,
                                              date: true,
                                              concepts: true,
                                              title: true,
                                              summary: true,
                                              medoidArticle: true,
                                              commonDates: true,
                                              socialScore: true,
                                              imageCount: 2,
                                            });
        this.returnInfo = new ReturnInfo({ articleInfo: this.articleInfo,
                                           sourceInfo: this.sourceInfo,
                                           conceptInfo: this.conceptInfo,
                                           locationInfo: this.locationInfo,
                                           categoryInfo: this.categoryInfo,
                                           eventInfo: this.eventInfo,
                                           storyInfo: this.storyInfo,
                                         });
    }

    public static initAPI(): EventRegistry {
        return new EventRegistry();
    }

    public async getArticlesQueryUriListForComplexQuery(er, cq) {
        const q = QueryArticles.initWithComplexQuery(cq);
        return await this.getQueryUriListForQueryArticles(er, q);
    }

    public async getEventsQueryUriListForComplexQuery(er, cq) {
        const q = QueryEvents.initWithComplexQuery(cq);
        return await this.getQueryUriListForQueryEvents(er, q);
    }

    public async getQueryUriListForQueryArticles(er, q) {
        const requestArticlesUriList = new RequestArticlesUriWgtList({count: 50000});
        q.setRequestedResult(requestArticlesUriList);
        const response = await er.execQuery(q);
        if (_.has(response, "error")) {
            throw new Error(_.get(response, "error"));
        }

        if (_.get(response, "info", "") === "No results match the search conditions.") {
            console.warn("One of the queries had no results to match the specified search conditions");
        }

        return _.get(response, "uriWgtList");
    }

    public async getQueryUriListForQueryEvents(er, q) {
        const requestEventsUriList = new RequestEventsUriWgtList({count: 50000});
        q.setRequestedResult(requestEventsUriList);
        const response = await er.execQuery(q);
        if (_.has(response, "error")) {
            throw new Error(_.get(response, "error"));
        }

        if (_.get(response, "info", "") === "No results match the search conditions.") {
            console.warn("One of the queries had no results to match the specified search conditions");
        }

        return _.get(response, "uriWgtList");
    }

    public ensureValidConcept(concept) {
        let result: ValidationObj = { pass: true };
        const propertyNames = ["uri", "label", "synonyms", "image", "trendingScore"];
        result = this.validateProperties(concept, "concept", propertyNames);
        if (!_.includes(["person", "loc", "org", "wiki"], _.get(concept, "type"))) {
            result = { pass: false, message: `Expected concept to be an entity type, but got ${_.get(concept, "type")}` };
        }

        if (_.has(concept, "location") && !_.isNil(_.get(concept, "location"))) {
            result = this.ensureValidLocation(_.get(concept, "location"));
        }

        return result;
    }

    public ensureValidLocation(location) {
        let result = { pass: true };
        const propertyNames = ["wikiUri", "label", "lat", "long", "geoNamesId", "population"];
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
    }

    public ensureValidArticle(article) {
        let result: ValidationObj = { pass: true };
        const propertyNames = [ "url",
                                "uri",
                                "title",
                                "body",
                                "source",
                                "location",
                                "duplicateList",
                                "originalArticle",
                                "time",
                                "date",
                                "categories",
                                "lang",
                                "extractedDates",
                                "concepts",
                              ];
        result = this.validateProperties(article, "article", propertyNames);

        _.each(_.get(article, "concepts", []), (concept) => {
            result = this.ensureValidConcept(concept);
        });
        if (!_.get(article, "isDuplicate") && !_.has(article, "eventUri")) {
            result = {pass: false, message: "Non duplicates should have event uris "};
        }
        return result;
    }

    public ensureValidEvent(event) {
        let result: ValidationObj = { pass: true };
        const propertyNames = [ "uri",
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
                                "images",
                              ];
        result = this.validateProperties(event, "event", propertyNames);

        _.each(_.get(event, "concepts", []), (concept) => {
            result = this.ensureValidConcept(concept);
        });

        _.each(_.get(event, "stories", []), (story) => {
            result = this.ensureValidStory(story);
        });

        _.each(_.get(event, "categories", []), (category) => {
            result = this.ensureValidCategory(category);
        });

        if (_.has(event, "location") && !_.isNil(_.get(event, "location"))) {
            result = this.ensureValidLocation(_.get(event, "location"));
        }
        return result;
    }

    public ensureValidStory(story) {
        const propertyNames = [ "uri",
                                "title",
                                "summary",
                                "concepts",
                                "categories",
                                "location",
                                "storyDate",
                                "averageDate",
                                "commonDates",
                                "socialScore",
                                "images",
                              ];
        let result = this.validateProperties(story, "story", propertyNames);
        if (_.has(story, "location") && !_.isNil(_.get(story, "location"))) {
            result = this.ensureValidLocation(_.get(story, "location"));
        }
        return result;
    }

    public ensureValidGeneralArticleList(articleList) {
        let result: ValidationObj = { pass: true };
        if (!_.has(articleList, "articles")) {
            result = { pass: false, message: "Expected to get 'articles'" };
        }
        _.each(_.get(articleList, "articles.results", []), (article) => {
            result = this.ensureValidArticle(article);
        });
        return result;
    }

    public ensureValidGeneralEventList(eventList) {
        let result: ValidationObj = { pass: true };
        if (!_.has(eventList, "events")) {
            result = { pass: false, message: "Expected to get 'events'" };
        }
        _.each(_.get(eventList, "events.results", []), (event) => {
            result = this.ensureValidEvent(event);
        });
        return result;
    }

    public ensureValidCategory(category) {
        const propertyNames = ["uri", "parentUri", "trendingScore"];
        return this.validateProperties(category, "category", propertyNames);
    }

    public ensureValidSource(source) {
        const propertyNames = ["uri", "location", "ranking", "articleCount", "sourceGroups"];
        return this.validateProperties(source, "source", propertyNames);
    }

    public ensureItemHasConcept(item, conceptUri) {
        if (!_.has(item, "concepts")) {
            return { pass: false, message: "Item doesn't contain concept array"};
        }

        if (!_.find(_.get(item, "concepts", []), ({uri}) => uri === conceptUri )) {
            return { pass: false, message: `Item doesn't contain ${conceptUri}`};
        }
        return { pass: true };
    }

    public ensureItemHasCategory(item, categoryUri) {
        if (!_.has(item, "categories")) {
            return { pass: false, message: "Item doesn't contain categories array"};
        }

        if (!_.some(_.get(item, "categories", []), (category) => _.includes(_.get(category, "uri"), categoryUri) )) {
            return { pass: false, message: `Item doesn't contain ${categoryUri}`};
        }
        return { pass: true };
    }

    public ensureItemHasSource(item, sourceUri) {
        if (_.get(item, "source.uri") !== sourceUri) {
            return {pass: false, message: `Source is not '${sourceUri}'`};
        }
        return { pass: true };
    }

    public ensureArticleBodyContainsText(article, text) {
        if (!_.has(article, "body")) {
            return { pass: false, message: "Article did not contain body"};
        }
        if (!this.doesContainText(_.get(article, "body", ""), text)) {
            return { pass: false, message: `"Article body did not contain text '${text}'`};
        }
        return { pass: true };
    }

    public ensureObjectContains(obj, propName: string) {
        if (!_.has(obj, propName)) {
            return { pass: false, message: `Specified object doesn't contain property ${propName}.`};
        }
        return { pass: true};
    }

    private validateProperties(item: object, objectName: string, propertyNames: string[]): ValidationObj {
        for (const propName of propertyNames) {
            if (!_.has(item, propName)) {
                return { pass: false, message: `Property '${propName}' was expected in a ${objectName}.` };
            }
        }
        return { pass: true };
    }

    private doesContainText(text, searchQuery) {
        return _.includes(_.deburr(_.toLower(text)), _.deburr(_.toLower(searchQuery)));
    }
}

const utils = new Utils();

beforeEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
    jasmine.addMatchers({
        toBeValidConcept: () => {
            return {
                compare: (concept) => {
                    return utils.ensureValidConcept(concept);
                },
            };
        },
        toBeValidArticle: () => {
            return {
                compare: (article) => {
                    return utils.ensureValidArticle(article);
                },
            };
        },
        toBeValidEvent: () => {
            return {
                compare: (event) => {
                    return utils.ensureValidEvent(event);
                },
            };
        },
        toBeValidGeneralEventList: () => {
            return {
                compare: (eventList) => {
                    return utils.ensureValidGeneralEventList(eventList);
                },
            };
        },
        toBeValidStory: () => {
            return {
                compare: (story) => {
                    return utils.ensureValidStory(story);
                },
            };
        },
        toBeValidGeneralArticleList: () => {
            return {
                compare: (articleList) => {
                    return utils.ensureValidGeneralArticleList(articleList);
                },
            };
        },
        toBeValidCategory: () => {
            return {
                compare: (category) => {
                    return utils.ensureValidCategory(category);
                },
            };
        },
        toBeValidSource: () => {
            return {
                compare: (source) => {
                    return utils.ensureValidSource(source);
                },
            };
        },
        toContainConcept: () => {
            return {
                compare: (item, conceptUri) => {
                    return utils.ensureItemHasConcept(item, conceptUri);
                },
            };
        },
        toContainSource: () => {
            return {
                compare: (item, sourceUri) => {
                    return utils.ensureItemHasSource(item, sourceUri);
                },
            };
        },
        toContainCategory: () => {
            return {
                compare: (item, categoryUri) => {
                    return utils.ensureItemHasCategory(item, categoryUri);
                },
            };
        },
        toContainBodyText: () => {
            return {
                compare: (article, text) => {
                    return utils.ensureArticleBodyContainsText(article, text);
                },
            };
        },
        toHaveProperty: () => {
            return {
                compare: (obj, propName) => {
                    return utils.ensureObjectContains(obj, propName);
                },
            };
        },
    });
});
