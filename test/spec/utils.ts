import {
    ArticleInfoFlags,
    CategoryInfoFlags,
    ConceptInfoFlags,
    ER,
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
    public er!: EventRegistry;

    constructor() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
        this.articleInfo = new ArticleInfoFlags({ concepts: true,
                                                  storyUri: true,
                                                  originalArticle: true,
                                                  categories: true,
                                                  videos: true,
                                                  image: true,
                                                  location: true,
                                                  extractedDates: true,
                                                  socialScore: true,
                                                  duplicateList: true,
                                                });
        this.sourceInfo = new SourceInfoFlags({ description: true,
                                                location: true,
                                                ranking: true,
                                                image: true,
                                                articleCount: true,
                                                socialMedia: true,
                                                sourceGroups: true,
                                              });
        this.conceptInfo = new ConceptInfoFlags({ type: ["concepts", "entities"],
                                                  lang: ["eng", "spa"],
                                                  synonyms: true,
                                                  image: true,
                                                  description: true,
                                                  trendingScore: true,
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
        this.categoryInfo = new CategoryInfoFlags({ trendingScore: true });
        this.eventInfo = new EventInfoFlags({ commonDates: true, stories: true, socialScore: true, categories: true, imageCount: 2 });
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
        if (!!response?.error) {
            throw new Error(response?.error);
        }

        return response?.uriWgtList;
    }

    public async getQueryUriListForQueryEvents(er, q) {
        const requestEventsUriList = new RequestEventsUriWgtList({count: 50000});
        q.setRequestedResult(requestEventsUriList);
        const response = await er.execQuery(q);
        if (!!response?.error) {
            throw new Error(response?.error);
        }

        return response?.uriWgtList;
    }

    public ensureValidConcept(concept) {
        let result: ValidationObj = { pass: true };
        const propertyNames = ["uri", "label", "synonyms", "image", "trendingScore"];
        result = this.validateProperties(concept, "concept", propertyNames);
        if (!["person", "loc", "org", "wiki"].includes(concept?.type)) {
            result = { pass: false, message: `Expected concept to be an entity type, but got ${concept?.type}` };
        }

        if (concept?.location && concept?.location !== null) {
            result = this.ensureValidLocation(concept?.location);
        }

        return result;
    }

    public ensureValidLocation(location) {
        let result = { pass: true };
        const propertyNames = ["wikiUri", "label", "lat", "long", "geoNamesId", "population"];
        result = this.validateProperties(location, "location", propertyNames);
        switch (location?.type) {
            case "country":
                result = this.validateProperties(location, "location", ["area", "code2", "code3", "webExt", "continent"]);
                break;
            case "place":
                result = this.validateProperties(location, "location", ["country"]); // featureCode can be optional
                break;
        }
        return result;
    }

    public ensureValidArticle(article: ER.Article) {
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
        const concepts = article?.concepts ?? [];
        for (const concept of concepts) {
            result = this.ensureValidConcept(concept);
        }

        if (!(article?.isDuplicate ?? false) && !article.hasOwnProperty("eventUri")) {
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
        const {
            concepts = [],
            stories = [],
            categories = [],
            location,
        } = event;

        for (const concept of concepts) {
            result = this.ensureValidConcept(concept);
        }

        for (const story of stories) {
            result = this.ensureValidStory(story);
        }

        for (const category of categories) {
            result = this.ensureValidCategory(category);
        }

        if (!!location) {
            result = this.ensureValidLocation(location);
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
        const { location } = story;
        if (!!location) {
            result = this.ensureValidLocation(location);
        }
        return result;
    }

    public ensureValidGeneralArticleList(articleList) {
        let result: ValidationObj = { pass: true };
        const { articles } = articleList;

        if (!articles) {
            result = { pass: false, message: "Expected to get 'articles'" };
        }
        const { results = [] } = articles;
        for (const article of results) {
            result = this.ensureValidArticle(article);
        }
        return result;
    }

    public ensureValidGeneralEventList(eventList) {
        let result: ValidationObj = { pass: true };
        const { events } = eventList;
        if (!events) {
            result = { pass: false, message: "Expected to get 'events'" };
        }
        const { results = [] } = events;
        for (const event of results) {
            result = this.ensureValidEvent(event);
        }
        return result;
    }

    public ensureValidCategory(category) {
        const propertyNames = ["uri", "trendingScore"];
        return this.validateProperties(category, "category", propertyNames);
    }

    public ensureValidSource(source) {
        const propertyNames = ["uri", "title", "description", "image", "favicon", "location", "ranking", "socialMedia"];
        return this.validateProperties(source, "source", propertyNames);
    }

    public ensureItemHasConcept(item, conceptUri) {
        const { concepts } = item;
        if (!concepts) {
            return { pass: false, message: "Item doesn't contain concept array"};
        }

        if (!(concepts ?? []).find(({uri}) => uri === conceptUri )) {
            return { pass: false, message: `Item doesn't contain ${conceptUri}`};
        }
        return { pass: true };
    }

    public ensureItemHasCategory(item, categoryUri) {
        const { categories } = item;

        if (!categories) {
            return { pass: false, message: "Item doesn't contain categories array"};
        }

        if (!item.categories.some((category) => category.uri && category.uri.includes(categoryUri))) {
            return { pass: false, message: `Item doesn't contain ${categoryUri}`};
        }
        return { pass: true };
    }

    public ensureItemHasSource(item, sourceUri) {
        if (item?.source?.uri !== sourceUri) {
            return {pass: false, message: `Source is not '${sourceUri}'`};
        }
        return { pass: true };
    }

    public ensureArticleBodyContainsText(article, text) {
        if (!article?.body) {
            return { pass: false, message: "Article did not contain body"};
        }
        if (!this.doesContainText(article?.body ?? "", text)) {
            return { pass: false, message: `"Article body did not contain text '${text}'`};
        }
        return { pass: true };
    }

    public ensureObjectContains(obj, propName: string) {
        if (!(propName in obj)) {
            return { pass: false, message: `Specified object doesn't contain property ${propName}.`};
        }
        return { pass: true};
    }

    public normalize(text: string) {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    private validateProperties(item: object, objectName: string, propertyNames: string[]): ValidationObj {
        for (const propName of propertyNames) {
            if (!item.hasOwnProperty(propName)) {
                return { pass: false, message: `Property '${propName}' was expected in a ${objectName}.` };
            }
        }
        return { pass: true };
    }

    private doesContainText(text: string, searchQuery: string) {
        return this.normalize(text).includes(this.normalize(searchQuery));
    }
}

const utils = new Utils();

beforeEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 120 * 1000;
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
