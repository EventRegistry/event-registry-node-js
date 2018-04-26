import * as _ from "lodash";
import {
    CategoryInfoFlags,
    ConceptInfoFlags,
    GetCategoryInfo,
    GetConceptInfo,
    GetSourceInfo,
    ReturnInfo,
    SourceInfoFlags,
} from "../../src/index";
import { Utils } from "./utils";

describe("Info", () => {
    const er = Utils.initAPI();

    it("should return sources by uri", async (done) => {
        const sources = await er.suggestNewsSources("a", {count: 10});
        const sourceUriList = _.map(sources, "uri") as string[];
        const sourceInfoFlags = new SourceInfoFlags({title: true,
                                                     description: true,
                                                     location: true,
                                                     ranking: true,
                                                     articleCount: true,
                                                     sourceGroups: true,
                                                    });
        const returnInfo = new ReturnInfo({sourceInfo: sourceInfoFlags});
        const q = new GetSourceInfo({uriOrUriList: sourceUriList, returnInfo: returnInfo});
        const response = await er.execQuery(q);
        expect(_.size(response)).toBe(_.size(sourceUriList), `Expected ${_.size(sourceUriList)} sources`);
        _.each(response, (item) => {
            expect(_.has(item, "uri")).toBeTruthy("Source uri is missing");
            expect(_.has(item, "title")).toBeTruthy("Source title is missing");
            expect(_.has(item, "description")).toBeTruthy("Source description is missing");
            expect(_.has(item, "ranking")).toBeTruthy("Source ranking is missing");
            expect(_.has(item, "articleCount")).toBeTruthy("Source articleCount is missing");
            expect(_.has(item, "sourceGroups")).toBeTruthy("Source sourceGroups is missing");
        });
        done();
    });

    it("should return concepts by uri", async (done) => {
        const concepts = await er.suggestConcepts("a", {count: 10});
        const uriList = _.map(concepts, "uri") as string[];
        const conceptInfoFlags = new ConceptInfoFlags({type: "wiki",
                                                       lang: ["deu", "slv"],
                                                       label: true,
                                                       synonyms: true,
                                                       image: true,
                                                       description: true,
                                                       conceptClassMembership: true,
                                                       conceptClassMembershipFull: true,
                                                       trendingScore: true,
                                                       trendingHistory: true,
                                                       trendingSource: ["news", "social"],
                                                      });
        const returnInfo = new ReturnInfo({conceptInfo: conceptInfoFlags});
        const q = new GetConceptInfo({uriOrUriList: uriList, returnInfo: returnInfo});
        const response = await er.execQuery(q);
        expect(_.size(response)).toBe(_.size(uriList), `Expected ${_.size(uriList)} concepts`);
        _.each(response, (item) => {
            expect(_.has(item, "uri")).toBeTruthy("Concept uri is missing");
            expect(_.has(item, "type")).toBeTruthy("Concept type is missing");
            expect(_.has(item, "label")).toBeTruthy("Concept should have a label");
            expect(_.has(item, "label.deu")).toBeTruthy("Concept should have a label in german");
            expect(_.has(item, "label.slv")).toBeTruthy("Concept should have a label in slovene");
            expect(_.has(item, "description")).toBeTruthy("Concept should have a description");
            expect(_.has(item, "image")).toBeTruthy("Concept should have an image");
            expect(_.has(item, "synonyms")).toBeTruthy("Concept should have synonyms");
            expect(_.has(item, "conceptClassMembership")).toBeTruthy("Concept should have conceptClassMembership");
            expect(_.has(item, "conceptClassMembershipFull")).toBeTruthy("Concept should have conceptClassMembershipFull");
            expect(_.has(item, "trendingScore")).toBeTruthy("Concept should have trendingScore");
            expect(_.has(item, "trendingScore.news")).toBeTruthy("Concept should have trendingScore for news");
            expect(_.has(item, "trendingScore.social")).toBeTruthy("Concept should have trendingScore for social");
            expect(_.has(item, "trendingHistory")).toBeTruthy("Concept should have trendingHistory");
            expect(_.has(item, "trendingHistory.news")).toBeTruthy("Concept should have trendingHistory for news");
            expect(_.has(item, "trendingHistory.social")).toBeTruthy("Concept should have trendingHistory for social");
        });
        done();
    });

    it("should return categories", async (done) => {
        const categories = await er.suggestCategories("a", {count: 10});
        const uriList = _.map(categories, "uri") as string[];
        const categoryInfoFlags = new CategoryInfoFlags({ parentUri: true,
                                                          childrenUris: true,
                                                          trendingScore: true,
                                                          trendingHistory: true,
                                                          trendingSource: ["news", "social"],
                                                        });
        const returnInfo = new ReturnInfo({categoryInfo: categoryInfoFlags});
        const q = new GetCategoryInfo({uriOrUriList: uriList, returnInfo: returnInfo});
        const response = await er.execQuery(q);
        expect(_.size(response)).toBe(_.size(uriList), `Expected ${_.size(uriList)} categories`);
        _.each(response, (item) => {
            expect(_.has(item, "uri")).toBeTruthy("Category uri is missing");
            expect(_.has(item, "parentUri")).toBeTruthy("Category parent uri is missing");
            expect(_.has(item, "childrenUris")).toBeTruthy("Category children uris are missing");
            expect(_.has(item, "trendingScore")).toBeTruthy("Category trending score is missing");
            expect(_.has(item, "trendingHistory")).toBeTruthy("Category trending history is missing");
            expect(_.has(item, "trendingScore.news")).toBeTruthy("Category trending score for news is missing");
            expect(_.has(item, "trendingScore.social")).toBeTruthy("Category trending score for social is missing");
            expect(_.has(item, "trendingHistory.news")).toBeTruthy("Category trending history for news is missing");
            expect(_.has(item, "trendingHistory.social")).toBeTruthy("Category trending history for social is missing");
        });
        done();
    });
});
